import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import { Category } from "../category/category.model";
import { CategoryService } from "../category/category.service";
import { Location } from "../location/location.model";
import { LocationService } from "../location/location.service";
import { Stuff } from "../stuff/stuff.model";
import { StuffService } from "../stuff/stuff.service";

type Mode = "category" | "location";
@Component({
  selector: "app-home",
  templateUrl: "./home.page.html",
  styleUrls: ["./home.page.scss"]
})
export class HomePage implements OnInit, OnDestroy {
  categories: Category[] = [];
  locations: Location[] = [];
  isLoading = false;
  mode: Mode = "category";
  private categorySub: Subscription;
  private locationSub: Subscription;

  constructor(
    private stuffService: StuffService,
    private categoryService: CategoryService,
    private locationService: LocationService
  ) {}

  async ngOnInit() {
    this.onSegmentChange("category");
  }

  onSegmentChange(value: Mode) {
    this.mode = value;
    if (value === "category" && !this.categorySub) {
      this.isLoading = true;
      let _stuffs: Stuff[] = [];
      console.log("segment");
      this.categorySub = this.stuffService.stuffs
        .pipe(
          switchMap(stuffs => {
            console.log(stuffs);
            _stuffs = [...stuffs];
            return this.categoryService.categories;
          })
        )
        .subscribe(categories => {
          console.log(categories);
          this.categories = categories;
          this.isLoading = false;
        });
    } else if (value === "location" && !this.locationSub) {
      this.isLoading = true;
      let _stuffs: Stuff[] = [];
      this.locationSub = this.stuffService.stuffs
        .pipe(
          switchMap(stuffs => {
            _stuffs = [...stuffs];
            return this.locationService.locations;
          })
        )
        .subscribe(locations => {
          this.locations = locations;
          this.isLoading = false;
        });
    }
  }

  ngOnDestroy() {
    if (this.categorySub) this.categorySub.unsubscribe();
    if (this.locationSub) this.locationSub.unsubscribe();
  }
}
