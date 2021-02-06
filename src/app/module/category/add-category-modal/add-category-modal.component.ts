import { Component, Input, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ModalController, ToastController } from "@ionic/angular";
import { take } from "rxjs/operators";
import categoryIcon from "../category-icon.json";
import { CategoryService } from "../category.service";

@Component({
  selector: "app-add-category-modal",
  templateUrl: "./add-category-modal.component.html",
  styleUrls: ["./add-category-modal.component.scss"]
})
export class AddCategoryModalComponent implements OnInit {
  @Input() id: number;
  form: FormGroup;
  icons = categoryIcon;
  isLoading = false;

  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      name: [null, [Validators.required]],
      icon: [null, [Validators.required]]
    });

    if (this.id) {
      this.isLoading = true;
      this.categoryService
        .getCategory(this.id)
        .pipe(take(1))
        .subscribe(
          category => {
            this.form.setValue({
              name: category.name,
              icon: category.icon
            });
            this.isLoading = false;
          },
          (err: Error) => {
            if (err.message === "not_found") {
              this.toastCtrl
                .create({
                  message: "Error in finding category. Please try again.",
                  duration: 3000,
                  color: "danger"
                })
                .then(toastEl => {
                  toastEl.present();
                  this.modalCtrl.dismiss();
                });
            }
          }
        );
    }
  }

  onCancel() {
    this.modalCtrl.dismiss();
  }

  onSubmit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    if (this.id) {
      this.categoryService
        .updateCategory(this.id, {
          ...this.form.value
        })
        .subscribe(() => {
          this.modalCtrl.dismiss();
        });
    } else {
      this.categoryService
        .addCategory({
          icon: this.form.value.icon,
          name: this.form.value.name
        })
        .subscribe(() => {
          this.modalCtrl.dismiss();
        });
    }
  }

  onSelectIcon(icon: string) {
    this.form.patchValue({
      icon
    });
  }
}
