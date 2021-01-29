import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { NavController } from "@ionic/angular";
import { zip } from "rxjs";
import {
  switchMap,
  distinctUntilChanged,
  map,
  throwIfEmpty,
  tap
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
export class StuffDetailPage implements OnInit {
  stuff: StuffWithRelations;
  isLoading = false;

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

          console.log("paramMap");
          return +paramMap.get("id");
        }),
        throwIfEmpty(),
        distinctUntilChanged(),
        tap(() => {
          this.isLoading = true;
        }),
        switchMap(id => {
          return this.stuffService.getStuff(id).pipe(
            switchMap(stuff => {
              console.log("stuff");
              return zip(
                this.categoryService.getCategory(stuff.categoryId),
                this.locationService.getLocation(stuff.locationId)
              ).pipe(
                map(data => {
                  console.log("location & category");
                  const newStuff: StuffWithRelations = {
                    ...stuff,
                    category: data[0],
                    location: data[1]
                  };
                  return newStuff;
                })
              );
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
  }
}
