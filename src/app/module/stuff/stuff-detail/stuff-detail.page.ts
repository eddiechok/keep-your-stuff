import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { NavController } from "@ionic/angular";
import { combineLatest, Subscription } from "rxjs";
import {
  switchMap,
  distinctUntilChanged,
  map,
  throwIfEmpty
} from "rxjs/operators";
import { CategoryService } from "../../category/category.service";
import { LocationService } from "../../location/location.service";
import { StuffWithRelations } from "../stuff.model";
import { StuffService } from "../stuff.service";

@Component({
  selector: "app-stuff-detail",
  templateUrl: "./stuff-detail.page.html",
  styleUrls: ["./stuff-detail.page.scss"]
})
export class StuffDetailPage implements OnInit, OnDestroy {
  stuff: StuffWithRelations;
  isLoading = false;
  private sub: Subscription;

  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private stuffService: StuffService,
    private categoryService: CategoryService,
    private locationService: LocationService
  ) {}

  ngOnInit() {
    this.route.paramMap
      .pipe(
        map(paramMap => {
          if (!paramMap.has("id")) {
            this.navCtrl.back();
            return;
          }
          return +paramMap.get("id");
        }),
        throwIfEmpty(),
        distinctUntilChanged()
      )
      .subscribe(id => {
        this.isLoading = true;
        this.sub = this.stuffService
          .getStuff(id)
          .pipe(
            switchMap(stuff => {
              console.log("stuff");
              return combineLatest(
                this.categoryService.getCategory(stuff.categoryId),
                this.locationService.getLocation(stuff.locationId)
              ).pipe(
                map(([category, location]) => {
                  console.log("stuff detail: category and location");
                  const newStuff: StuffWithRelations = {
                    ...stuff,
                    category: category,
                    location: location
                  };
                  return newStuff;
                })
              );
            })
          )
          .subscribe(
            stuff => {
              this.stuff = stuff;
              this.isLoading = false;
            },
            error => {
              this.isLoading = false;
            }
          );
      });
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }
}
