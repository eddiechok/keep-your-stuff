import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { NavController } from "@ionic/angular";
import { Observable, Subscription, combineLatest } from "rxjs";
import { map } from "rxjs/operators";
import { CategoryService } from "../../category/category.service";
import { LocationService } from "../../location/location.service";
import { Stuff } from "../stuff.model";
import { StuffService } from "../stuff.service";

@Component({
  selector: "app-stuff-by-type",
  templateUrl: "./stuff-by-type.page.html",
  styleUrls: ["./stuff-by-type.page.scss"]
})
export class StuffByTypePage implements OnInit, OnDestroy {
  title: string;
  stuffs: Stuff[];
  isLoading = false;
  type: string;
  id: number;
  private sub: Subscription;

  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private categoryService: CategoryService,
    private stuffService: StuffService,
    private locationService: LocationService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has("id") || !paramMap.has("type")) {
        this.navCtrl.back();
      }
      this.isLoading = true;
      this.id = +paramMap.get("id");
      this.type = paramMap.get("type");
      let obs$: Observable<any>;

      if (this.type === "category") {
        obs$ = this.categoryService.getCategory(this.id);
      } else if (this.type === "location") {
        obs$ = this.locationService.getLocation(this.id);
      } else {
        this.navCtrl.back();
      }

      this.sub = combineLatest([obs$, this.stuffService.stuffs])
        .pipe(
          map(data => {
            data[1] = data[1].filter(stuff => {
              if (this.type === "category") {
                return stuff.categoryId === this.id;
              } else if (this.type === "location") {
                return stuff.locationId === this.id;
              }
            });
            return data;
          })
        )
        .subscribe(data => {
          this.title = data[0].name;
          this.stuffs = data[1];
          this.isLoading = false;
        });
    });
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }
}
