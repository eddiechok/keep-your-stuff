import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { Location } from "./location.model";
import { map, take, tap } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class LocationService {
  private _locations = new BehaviorSubject<Location[]>([
    {
      id: 1,
      name: "Wardrobe",
      color: "primary"
    },
    {
      id: 2,
      name: "Wardrobe",
      color: "danger"
    }
  ]);

  constructor() {}

  get locations() {
    return this._locations.asObservable();
  }

  getLocation(id: number) {
    return this._locations.pipe(
      map(locations => {
        return { ...locations.find(location => location.id === id) };
      })
    );
  }

  addLocation(category: Omit<Location, "id">) {
    return this._locations.pipe(
      take(1),
      tap(locations => {
        const newLocation: Location = {
          id: locations.length + 1,
          ...category
        };

        this._locations.next(locations.concat(newLocation));
      })
    );
  }

  updateLocation(id: number, data: Omit<Location, "id">) {
    return this._locations.pipe(
      take(1),
      tap(locations => {
        const newCategories = [...locations];
        const updateLocationIndex = newCategories.findIndex(
          category => category.id === id
        );
        newCategories[updateLocationIndex] = {
          ...newCategories[updateLocationIndex],
          ...data
        };

        this._locations.next(newCategories);
      })
    );
  }

  deleteLocation(id: number) {
    return this._locations.pipe(
      take(1),
      tap(locations => {
        this._locations.next(locations.filter(category => category.id !== id));
      })
    );
  }
}
