import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { NavController } from "@ionic/angular";
import { Subscription, zip } from "rxjs";
import { map } from "rxjs/operators";
import { Category } from "../../category/category.model";
import { CategoryService } from "../../category/category.service";
import { Stuff } from "../../stuff/stuff.model";
import { StuffService } from "../../stuff/stuff.service";

@Component({
  selector: "app-stuff-by-category",
  templateUrl: "./stuff-by-category.page.html",
  styleUrls: ["./stuff-by-category.page.scss"]
})
export class StuffByCategoryPage implements OnInit, OnDestroy {
  category: Category;
  stuffs: Stuff[];
  isLoading = false;
  private sub: Subscription;

  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private categoryService: CategoryService,
    private stuffService: StuffService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has("id")) {
        this.navCtrl.back();
      }
      this.isLoading = true;
      const id = +paramMap.get("id");
      this.sub = zip(
        this.categoryService.getCategory(id),
        this.stuffService.stuffs
      )
        .pipe(
          map(data => {
            data[1] = data[1].filter(stuff => stuff.categoryId === id);
            return data;
          })
        )
        .subscribe(data => {
          this.category = data[0];
          this.stuffs = data[1];
          this.isLoading = false;
        });
    });
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }
}
