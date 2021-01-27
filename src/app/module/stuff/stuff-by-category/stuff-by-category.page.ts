import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { NavController } from "@ionic/angular";
import { Category } from "../../category/category.model";
import { CategoryService } from "../../category/category.service";
import { Subscription } from "rxjs";
import { Stuff } from "../../stuff/stuff.model";
import { StuffService } from "../../stuff/stuff.service";
import { map, switchMap } from "rxjs/operators";

@Component({
  selector: "app-stuff-by-category",
  templateUrl: "./stuff-by-category.page.html",
  styleUrls: ["./stuff-by-category.page.scss"]
})
export class StuffByCategoryPage implements OnInit, OnDestroy {
  category: Category;
  stuffs: Stuff[];
  isLoading = false;
  private categorySub: Subscription;

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
      this.categorySub = this.categoryService
        .getCategory(id)
        .pipe(
          switchMap(category => {
            this.category = category;
            return this.stuffService.stuffs;
          }),
          map(stuffs => stuffs.filter(stuff => stuff.categoryId === id))
        )
        .subscribe(stuffs => {
          this.stuffs = stuffs;
          this.isLoading = false;
        });
    });
  }

  ngOnDestroy() {
    if (this.categorySub) this.categorySub.unsubscribe();
  }
}
