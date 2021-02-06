import { Component, OnDestroy, OnInit } from "@angular/core";
import {
  AlertController,
  IonItemSliding,
  LoadingController,
  ModalController,
  ToastController
} from "@ionic/angular";
import { Subscription } from "rxjs";
import { AddCategoryModalComponent } from "../add-category-modal/add-category-modal.component";
import { Category } from "../category.model";
import { CategoryService } from "../category.service";

@Component({
  selector: "app-category-list",
  templateUrl: "./category-list.page.html",
  styleUrls: ["./category-list.page.scss"]
})
export class CategoryListPage implements OnInit, OnDestroy {
  private categorySub: Subscription;
  categories: Category[];
  isLoading = false;

  constructor(
    private categoryService: CategoryService,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.isLoading = true;
    this.categorySub = this.categoryService.categories.subscribe(categories => {
      this.categories = categories;
      this.isLoading = false;
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
              this.loadingCtrl
                .create({
                  message: "Deleting..."
                })
                .then(el => {
                  el.present();
                  this.categoryService.deleteCategory(id).subscribe(
                    () => {
                      el.dismiss();
                    },
                    err => {
                      let errorMsg: string;
                      if (err === "stuffs_not_empty") {
                        errorMsg =
                          "There are still stuffs in this category. Please remove all the stuffs in it before deleting.";
                      } else if (err === "not_found") {
                        errorMsg = "Category not found. Please try again";
                      }
                      this.toastCtrl
                        .create({
                          message: errorMsg,
                          duration: 5000,
                          color: "danger"
                        })
                        .then(toastEl => toastEl.present());
                      el.dismiss();
                    }
                  );
                });
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
