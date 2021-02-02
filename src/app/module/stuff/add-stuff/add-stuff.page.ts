import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import {
  AlertController,
  LoadingController,
  ModalController,
  PickerController
} from "@ionic/angular";
import { PickerColumnOption } from "@ionic/core";
import { Subscription, combineLatest } from "rxjs";
import { AddCategoryModalComponent } from "../../category/add-category-modal/add-category-modal.component";
import { Category } from "../../category/category.model";
import { CategoryService } from "../../category/category.service";
import { AddLocationModalComponent } from "../../location/add-location-modal/add-location-modal.component";
import { Location } from "../../location/location.model";
import { LocationService } from "../../location/location.service";
import { StuffService } from "../stuff.service";
import { NotificationService } from "src/app/shared/services/notification.service";

@Component({
  selector: "app-add-stuff",
  templateUrl: "./add-stuff.page.html",
  styleUrls: ["./add-stuff.page.scss"]
})
export class AddStuffPage implements OnInit, OnDestroy {
  form = this.fb.group({
    name: [null, Validators.required],
    desc: [null],
    imgUrl: [null],
    category: [null, Validators.required],
    location: [null, Validators.required],
    expiryDate: [null]
  });
  isLoading = false;
  defaultTime = new Date(new Date().setHours(9, 0)).toISOString();
  selected = {
    category: "",
    location: ""
  };

  private categories: Category[] = [];
  private locations: Location[] = [];
  private sub: Subscription;

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private locationService: LocationService,
    private stuffService: StuffService,
    private pickerCtrl: PickerController,
    private modalCtrl: ModalController,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.sub = combineLatest(
      this.categoryService.categories,
      this.locationService.locations
    ).subscribe(([categories, locations]) => {
      this.categories = [...categories];
      this.locations = [...locations];
      this.isLoading = false;
    });
  }

  async openPicker(
    name: string,
    data: { id: number; name: string }[],
    selectedIndex?: number
  ) {
    const options: PickerColumnOption[] = [];

    data.forEach(item => {
      options.push({
        text: item.name,
        value: item
      });
    });

    const picker = await this.pickerCtrl.create({
      columns: [
        {
          name: name,
          options: options
        }
      ],
      buttons: [
        {
          text: "Add",
          handler: () => {
            this.modalCtrl
              .create({
                component:
                  name === "category"
                    ? AddCategoryModalComponent
                    : AddLocationModalComponent
              })
              .then(el => {
                el.present();
              });
          }
        },
        {
          text: "Confirm",
          handler: data => {
            const selected = data[name].value as { id: number; name: string };
            this.form.patchValue({ [name]: selected.id });
            this.selected[name] = selected.name;
          }
        }
      ]
    });

    if (selectedIndex !== undefined) {
      picker.columns[0].selectedIndex = selectedIndex;
    }
    await picker.present();
  }

  onSelectCategory() {
    const categoryId = this.form.get("category").value;
    let selectedCateogryIndex: number;
    if (categoryId) {
      selectedCateogryIndex = this.categories.findIndex(
        category => category.id === categoryId
      );
    }
    this.openPicker("category", this.categories, selectedCateogryIndex);
  }

  onSelectLocation() {
    const locationId = this.form.get("location").value;
    let selectedLocationIndex: number;
    if (locationId) {
      selectedLocationIndex = this.categories.findIndex(
        location => location.id === locationId
      );
    }
    this.openPicker("location", this.locations, selectedLocationIndex);
  }

  onFileSelected(imagePath) {
    this.form.patchValue({
      imgUrl: imagePath
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loadingCtrl
      .create({
        message: "Adding..."
      })
      .then(loadingEl => {
        loadingEl.present();
        this.stuffService
          .addStuff({
            ...this.form.value,
            categoryId: this.form.value.category,
            locationId: this.form.value.location
          })
          .subscribe(newId => {
            loadingEl.dismiss();
            this.alertCtrl
              .create({
                header: "Success!",
                message:
                  "Your stuff is added successfully. Do you want to continue to add more stuff?",
                buttons: [
                  {
                    text: "View Stuff",
                    handler: () => {
                      this.form.reset();
                      this.selected = {
                        category: "",
                        location: ""
                      };
                      this.router.navigateByUrl(`/stuff/${newId}`, {
                        replaceUrl: true
                      });
                    }
                  },
                  {
                    text: "Add New",
                    role: "cancel",
                    handler: () => {
                      this.form.reset();
                      this.selected = {
                        category: "",
                        location: ""
                      };
                    }
                  }
                ]
              })
              .then(alertEl => {
                alertEl.present();
              });

            // schedule notifications
            if (this.form.value.expiryDate) {
              this.notificationService.rescheduleNotification({
                ...this.form.value,
                categoryId: this.form.value.category,
                locationId: this.form.value.location,
                id: newId
              });
            }
          });
      });
  }

  canDeactivate() {
    return !this.form.dirty;
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }
}
