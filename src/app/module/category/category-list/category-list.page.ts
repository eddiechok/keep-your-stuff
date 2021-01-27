import { Component, OnInit, OnDestroy } from "@angular/core";
import { CategoryService } from "../category.service";
import { Subscription } from "rxjs";
import { Category } from "../category.model";
import {
  ModalController,
  AlertController,
  IonItemSliding
} from "@ionic/angular";
import { AddCategoryModalComponent } from "../add-category-modal/add-category-modal.component";

@Component({
  selector: "app-category-list",
  templateUrl: "./category-list.page.html",
  styleUrls: ["./category-list.page.scss"]
})
export class CategoryListPage implements OnInit, OnDestroy {
  private categorySub: Subscription;
  categories: Category[];

  constructor(
    private categoryService: CategoryService,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.categorySub = this.categoryService.categories.subscribe(categories => {
      this.categories = categories;
    });
  }

  ngOnDestroy() {
    if (this.categorySub) this.categorySub.unsubscribe();
  }

  onAddCategory() {
    this.modalCtrl
      .create({
        component: AddCategoryModalComponent
      })
      .then(el => {
        el.present();
      });
  }

  onDelete(id: number, slidingItem: IonItemSliding) {
    slidingItem.close();
    this.alertCtrl
      .create({
        header: "Confirm to delete?",
        message: "Deleted category cannot be reverted.",
        buttons: [
          {
            text: "Cancel",
            role: "cancel"
          },
          {
            text: "Delete",
            cssClass: "ion-text-danger",
            handler: () => {
              this.categoryService.deleteCategory(id).subscribe();
            }
          }
        ]
      })
      .then(el => {
        el.present();
      });
  }

  onEdit(id: number, slidingItem: IonItemSliding) {
    slidingItem.close();
    this.modalCtrl
      .create({
        component: AddCategoryModalComponent,
        componentProps: {
          id
        }
      })
      .then(el => {
        el.present();
      });
  }
}
