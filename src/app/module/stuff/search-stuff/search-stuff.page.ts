import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import { Stuff, StuffWithRelations } from "../stuff.model";
import { StuffService } from "../stuff.service";
import { Category } from "../../category/category.model";
import { Location } from "../../location/location.model";
import { CategoryService } from "../../category/category.service";
import { LocationService } from "../../location/location.service";
import { delay, switchMap, map } from "rxjs/operators";

@Component({
  selector: "app-search-stuff",
  templateUrl: "./search-stuff.page.html",
  styleUrls: ["./search-stuff.page.scss"]
})
export class SearchStuffPage implements OnInit, OnDestroy {
  private stuffSub: Subscription;
  stuffs: StuffWithRelations[] = [];
  isLoading = false;

  constructor(
    private stuffService: StuffService,
    private categoryService: CategoryService,
    private locationService: LocationService
  ) {}

  ngOnInit() {
    let _locations: Location[] = [];
    let _categories: Category[] = [];

    this.isLoading = true;
    this.stuffSub = this.categoryService.categories
      .pipe(
        delay(1000),
        switchMap(categories => {
          console.log("categories");
          _categories = [...categories];
          return this.locationService.locations;
        }),
        delay(1000),
        switchMap(locations => {
          console.log("locations");
          _locations = [...locations];
          return this.stuffService.stuffs;
        }),
        map(stuffs => {
          console.log("stuffs");
          let newStuffs: StuffWithRelations[] = [];

          stuffs.forEach(stuff => {
            const selectedCategory = _categories.find(
              category => category.id === stuff.categoryId
            );
            const selectedLocation = _locations.find(
              location => location.id === stuff.locationId
            );

            newStuffs.push({
              ...stuff,
              category: selectedCategory,
              location: selectedLocation
            });
          });

          return newStuffs;
        })
      )
      .subscribe(newStuffs => {
        this.stuffs = newStuffs;
        this.isLoading = false;
      });
  }

  ngOnDestroy() {
    if (this.stuffSub) this.stuffSub.unsubscribe();
  }
}
