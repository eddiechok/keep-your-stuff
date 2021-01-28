import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subscription, Observable, Subject } from "rxjs";
import {
  map,
  switchMap,
  distinctUntilChanged,
  takeUntil,
  tap,
  filter
} from "rxjs/operators";
import { Category } from "../../category/category.model";
import { CategoryService } from "../../category/category.service";
import { Location } from "../../location/location.model";
import { LocationService } from "../../location/location.service";
import { StuffWithRelations } from "../stuff.model";
import { StuffService } from "../stuff.service";

@Component({
  selector: "app-search-stuff",
  templateUrl: "./search-stuff.page.html",
  styleUrls: ["./search-stuff.page.scss"]
})
export class SearchStuffPage implements OnInit, OnDestroy {
  private searchSub: Subscription;
  private search$ = new Subject<string>();
  private stopSearch$ = new Subject();
  searchStuffs: StuffWithRelations[] = [];
  isLoading = false;
  searchValue = "";

  constructor(
    private stuffService: StuffService,
    private categoryService: CategoryService,
    private locationService: LocationService
  ) {}

  ngOnInit() {
    let _locations: Location[] = [];
    let _categories: Category[] = [];

    const stopSearchObs$ = this.stopSearch$.pipe(
      tap(() => {
        this.isLoading = false;
      })
    );

    this.searchSub = this.search$
      .pipe(
        filter(value => !!value), // filter empty value
        distinctUntilChanged(),
        switchMap(() => {
          this.isLoading = true;
          return this.categoryService.categories.pipe(
            takeUntil(stopSearchObs$)
          );
        }),
        switchMap(categories => {
          console.log("categories");
          _categories = [...categories];
          return this.locationService.locations.pipe(takeUntil(stopSearchObs$));
        }),
        switchMap(locations => {
          console.log("locations");
          _locations = [...locations];
          return this.stuffService.stuffs.pipe(takeUntil(stopSearchObs$));
        }),
        map(stuffs => {
          console.log("stuffs");
          let newStuffs: StuffWithRelations[] = [];

          // filter stuffs with keyword
          stuffs
            .filter(stuff =>
              stuff.name
                .toLocaleLowerCase()
                .includes(this.searchValue.toLocaleLowerCase())
            )
            .forEach(stuff => {
              // get category and location details
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
        this.searchStuffs = newStuffs;
        this.isLoading = false;
      });
  }

  onSearch(event) {
    const value = event.target.value as string;
    this.searchValue = value;

    // stop ongoing subscription
    this.stopSearch$.next();

    // emit new search value
    this.search$.next(value);
  }

  ngOnDestroy() {
    if (this.searchSub) this.searchSub.unsubscribe();
  }
}
