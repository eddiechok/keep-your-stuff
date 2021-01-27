import { Injectable } from "@angular/core";
import { Stuff } from "./stuff.model";
import { BehaviorSubject } from "rxjs";
import { take, map } from "rxjs/operators";
import { Category } from "../category/category.model";
import { Location } from "../location/location.model";

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
        imgUrl:
          "https://upload.wikimedia.org/wikipedia/commons/0/08/Pencils_hb.jpg"
      });
    }
    this._stuffs.next(stuffs);
  }

  get stuffs() {
    return this._stuffs.asObservable();
  }

  // get stuffs() {
  //   return this._stuffs.pipe(
  //     map(oriStuffs => {
  //       let stuffs: Stuff[] = [];

  //       oriStuffs.forEach(stuff => {
  //         let selectedCategory: Category;
  //         let selectedLocation: Location;

  //         this.categoryService
  //           .getCategory(stuff.categoryId)
  //           .pipe(take(1))
  //           .subscribe(category => {
  //             selectedCategory = category;
  //           });

  //         this.locationService
  //           .getLocation(stuff.locationId)
  //           .pipe(take(1))
  //           .subscribe(location => {
  //             selectedLocation = location;
  //           });

  //         stuffs.push({
  //           ...stuff,
  //           category: selectedCategory,
  //           location: selectedLocation
  //         });
  //       });

  //       return stuffs;
  //     })
  //   );
  // }
}
