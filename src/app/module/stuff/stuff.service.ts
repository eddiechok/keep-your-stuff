import { Injectable } from "@angular/core";
import { BehaviorSubject, combineLatest, Observable, of } from "rxjs";
import { map, switchMap, take, tap } from "rxjs/operators";
import { DbService } from "src/app/shared/services/db.service";
import { Stuff } from "./stuff.model";

@Injectable({
  providedIn: "root"
})
export class StuffService {
  private _stuffs = new BehaviorSubject<Stuff[]>([]);

  constructor(private db: DbService) {
    this.loadStuffs().subscribe();
  }

  get stuffs() {
    return this._stuffs.asObservable();
  }

  loadStuffs() {
    return this.db.getRows("stuff").pipe(
      tap(stuffs => {
        this._stuffs.next(stuffs);
      })
    );
  }

  getStuff(id: number) {
    return this._stuffs.pipe(
      switchMap(stuffs => {
        const stuff = stuffs.find(stuff => stuff.id === id);
        if (stuff) {
          return of(stuff);
        } else {
          return this.db.getRowById("stuff", id) as Observable<Stuff>;
        }
      }),
      tap(stuff => {
        if (!stuff) throw new Error("not_found");
      })
    );
  }

  addStuff(stuff: Omit<Stuff, "id">) {
    return combineLatest([
      this.db.insertRow("stuff", stuff),
      this._stuffs.pipe(take(1))
    ]).pipe(
      tap(([id, stuffs]) => {
        const newStuff: Stuff = {
          id,
          ...stuff
        };
        this._stuffs.next(stuffs.concat(newStuff));
      }),
      map(([id, _]) => id)
    );
  }

  updateStuff(id: number, data: Omit<Stuff, "id">) {
    console.log(data);
    return combineLatest([
      this.db.updateRowById("stuff", data, id),
      this._stuffs.pipe(take(1))
    ]).pipe(
      tap(([_, stuffs]) => {
        const newStuffs = [...stuffs];
        const updateStuffIndex = newStuffs.findIndex(stuff => stuff.id === id);
        newStuffs[updateStuffIndex] = {
          ...newStuffs[updateStuffIndex],
          ...data
        };

        this._stuffs.next(newStuffs);
      })
    );
  }

  deleteStuff(id: number) {
    return combineLatest([
      this.db.deleteRowById("stuff", id),
      this._stuffs.pipe(take(1))
    ]).pipe(
      tap(([_, stuffs]) => {
        this._stuffs.next(stuffs.filter(stuff => stuff.id !== id));
      })
    );
  }
}
