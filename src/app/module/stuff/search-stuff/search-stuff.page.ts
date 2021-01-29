import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subject, Subscription, zip } from "rxjs";
import {
  distinctUntilChanged,
  filter,
  map,
  switchMap,
  takeUntil,
  tap,
  debounceTime
} from "rxjs/operators";
import { CategoryService } from "../../category/category.service";
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
  private stopSearch$ = new Subject<string>();
  searchStuffs: StuffWithRelations[] = [];
  isLoading = false;
  searchValue = "";

  constructor(
    private stuffService: StuffService,
    private categoryService: CategoryService,
    private locationService: LocationService
  ) {}

  ngOnInit() {
    this.searchSub = this.search$
      .pipe(
        debounceTime(500),
        tap(value => {
          this.searchValue = value;
        }),
        filter(value => {
          return !!value;
        }), // filter empty value
        switchMap(() => {
          this.isLoading = true;
          return zip(
            this.categoryService.categories,
            this.locationService.locations,
            this.stuffService.stuffs
          ).pipe(
            takeUntil(
              this.stopSearch$.pipe(
                tap(() => {
                  this.isLoading = false;
                })
              )
            )
          );
        }),
        map(data => {
          console.log("stuffs, locations, categories");
          const categories = data[0];
          const locations = data[1];
          const stuffs = data[2];
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
              const selectedCategory = categories.find(
                category => category.id === stuff.categoryId
              );
              const selectedLocation = locations.find(
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

    // stop ongoing subscription
    this.stopSearch$.next(value);

    // emit new search value
    this.search$.next(value);
  }

  ngOnDestroy() {
    if (this.searchSub) this.searchSub.unsubscribe();
  }
}
