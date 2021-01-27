import { Component, OnInit, ElementRef, Input } from "@angular/core";
import { ModalController, IonItemSliding } from "@ionic/angular";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { CategoryService } from "../category.service";
import categoryIcon from "../category-icon.json";
import { Category } from "../category.model";
import { take, delay } from "rxjs/operators";

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
    private categoryService: CategoryService
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
        .pipe(take(1), delay(1000))
        .subscribe(category => {
          this.form.setValue({
            name: category.name,
            icon: category.icon
          });
          this.isLoading = false;
        });
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
          ...this.form.value
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
