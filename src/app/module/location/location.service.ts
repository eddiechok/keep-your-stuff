import { Injectable } from "@angular/core";
import {
  BehaviorSubject,
  combineLatest,
  Observable,
  of,
  ReplaySubject,
  throwError
} from "rxjs";
import { map, switchMap, take, tap } from "rxjs/operators";
import { DbService } from "src/app/shared/services/db.service";
import { Location } from "./location.model";

@Injectable({
  providedIn: "root"
})
export class LocationService {
  private _locations = new ReplaySubject<Location[]>(1);

  constructor(private db: DbService) {
    this.db.startDb$.pipe(switchMap(() => this.loadLocations())).subscribe();
  }

  get locations() {
    return this._locations.asObservable();
  }

  loadLocations() {
    const sql = `SELECT a.*, COUNT(b.id) as stuffs 
    FROM location as a 
    LEFT JOIN stuff as b ON b.locationId = a.id 
    GROUP BY a.id`;

    return this.db.getRowsBySql(sql).pipe(
      tap(locations => {
        this._locations.next(locations);
      })
    );
  }

  getLocation(id: number) {
    return this._locations.pipe(
      switchMap(locations => {
        const location = locations.find(location => location.id === id);
        if (location) {
          return of(location);
        } else {
          return this.db.getRowById("location", id) as Observable<Location>;
        }
      }),
      tap(location => {
        if (!location) throw new Error("not_found");
      })
    );
  }

  addLocation(location: Omit<Location, "id">) {
    return combineLatest([
      this.db.insertRow("location", location),
      this._locations.pipe(take(1))
    ]).pipe(
      tap(([id, locations]) => {
        const newLocation: Location = {
          id,
          ...location
        };
        this._locations.next(locations.concat(newLocation));
      })
    );
  }

  updateLocation(id: number, data: Omit<Location, "id">) {
    return combineLatest([
      this.db.updateRowById("location", data, id),
      this._locations.pipe(take(1))
    ]).pipe(
      tap(([_, locations]) => {
        const newLocations = [...locations];
        const updateLocationIndex = newLocations.findIndex(
          location => location.id === id
        );
        newLocations[updateLocationIndex] = {
          ...newLocations[updateLocationIndex],
          ...data
        };

        this._locations.next(newLocations);
      })
    );
  }

  deleteLocation(id: number) {
    return this._locations.pipe(
      take(1),
      switchMap(locations => {
        const location = locations.find(location => location.id === id);
        if (!location) {
          return throwError("not_found");
        } else if (location.stuffs) {
          return throwError("stuffs_not_empty");
        } else {
          return this.db
            .deleteRowById("location", id)
            .pipe(map(() => locations));
        }
      }),
      tap(locations => {
        this._locations.next(locations.filter(location => location.id !== id));
      })
    );
  }
}
