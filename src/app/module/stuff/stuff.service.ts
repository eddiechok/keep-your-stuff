import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { delay, map, take, tap } from "rxjs/operators";
import { Stuff } from "./stuff.model";

function getImgSrc() {
  const src = `https://dummyimage.com/600x400/${Math.round(
    Math.random() * 99999
  )}/fff.png`;
  return src;
}
@Injectable({
  providedIn: "root"
})
export class StuffService {
  private _stuffs = new BehaviorSubject<Stuff[]>([
    {
      id: 1,
      name: "Pencil",
      categoryId: 1,
      locationId: 1,
      imgUrl:
        "https://upload.wikimedia.org/wikipedia/commons/0/08/Pencils_hb.jpg"
    }
  ]);

  constructor() {
    const stuffs: Stuff[] = [];
    for (let i = 1; i <= 1000; i++) {
      stuffs.push({
        id: i,
        name: "Pencil",
        categoryId: 1,
        locationId: 1,
        imgUrl: getImgSrc()
        // "https://upload.wikimedia.org/wikipedia/commons/0/08/Pencils_hb.jpg"
      });
    }
    this._stuffs.next(stuffs);
  }

  get stuffs() {
    return this._stuffs.pipe(delay(1000));
  }

  getStuff(id: number) {
    return this._stuffs.pipe(
      delay(1000),
      map(stuffs => {
        const stuff = stuffs.find(stuff => stuff.id === id);
        if (stuff) {
          return { ...stuff };
        } else {
          throw new Error("NO_RECORD_FOUND");
        }
      })
    );
  }

  addStuff(stuff: Omit<Stuff, "id">) {
    return this._stuffs.pipe(
      take(1),
      map(stuffs => {
        const id = stuffs.length + 1;

        this._stuffs.next(
          stuffs.concat({
            id: id,
            ...stuff
          })
        );

        return id;
      })
    );
  }

  updateStuff(editedStuff: Stuff) {
    return this._stuffs.pipe(
      delay(1000),
      take(1),
      map(stuffs => {
        const updatedStuffs = [...stuffs];
        const updatedIndex = updatedStuffs.findIndex(
          stuff => stuff.id === editedStuff.id
        );
        updatedStuffs[updatedIndex] = {
          ...updatedStuffs[updatedIndex],
          ...editedStuff
        };
        this._stuffs.next(updatedStuffs);
        return;
      })
    );
  }
}
