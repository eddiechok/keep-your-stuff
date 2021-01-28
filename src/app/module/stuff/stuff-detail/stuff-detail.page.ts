import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { NavController } from "@ionic/angular";
import { Subscription } from "rxjs";
import { switchMap } from "rxjs/operators";
import { Category } from "../../category/category.model";
import { CategoryService } from "../../category/category.service";
import { LocationService } from "../../location/location.service";
import { Stuff, StuffWithRelations } from "../stuff.model";
import { StuffService } from "../stuff.service";

@Component({
  selector: "app-stuff-detail",
  templateUrl: "./stuff-detail.page.html",
  styleUrls: ["./stuff-detail.page.scss"]
})
export class StuffDetailPage implements OnInit, OnDestroy {
  stuff: StuffWithRelations;
  isLoading = false;
  private stuffSub: Subscription;

  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private stuffService: StuffService,
    private categoryService: CategoryService,
    private locationService: LocationService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has("id")) {
        this.navCtrl.back();
        return;
      }

      this.isLoading = true;

      const id = +paramMap.get("id");
      let selectedStuff: Stuff;
      let selectedCategory: Category;

      this.stuffSub = this.stuffService
        .getStuff(id)
        .pipe(
          switchMap(stuff => {
            selectedStuff = stuff;
            console.log("stuff");
            return this.categoryService.getCategory(stuff.categoryId);
          }),
          switchMap(category => {
            console.log("category");
            selectedCategory = category;
            return this.locationService.getLocation(selectedStuff.locationId);
          })
        )
        .subscribe(
          location => {
            console.log("location");
            this.stuff = {
              ...selectedStuff,
              category: selectedCategory,
              location
            };
            this.isLoading = false;
          },
          error => {
            this.isLoading = false;
          }
        );
    });
  }

  ngOnDestroy() {
    if (this.stuffSub) this.stuffSub.unsubscribe();
  }
}
