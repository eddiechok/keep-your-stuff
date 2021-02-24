import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
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
import { map, switchMap } from "rxjs/operators";
import { CameraPhoto } from "@capacitor/core";

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
  private selectedImage: CameraPhoto;

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
    private notificationService: NotificationService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.sub = combineLatest([
      this.route.paramMap,
      this.categoryService.categories,
      this.locationService.locations
    ]).subscribe(([paramMap, categories, locations]) => {
      // if add stuff from stuff-by-type page
      if (paramMap.has("type") && paramMap.has("id")) {
        const type = paramMap.get("type");
        const id = +paramMap.get("id");

        // assign selected category or location
        if (type === "category") {
          const selectedCategory = categories.find(
            category => category.id === id
          );
          if (selectedCategory) {
            this.form.patchValue({ [type]: id });
            this.selected[type] = selectedCategory.name;
          }
        } else {
          const selectedLocation = locations.find(
            location => location.id === id
          );
          if (selectedLocation) {
            this.form.patchValue({ [type]: id });
            this.selected[type] = selectedLocation.name;
          }
        }
      }
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
      mode: "ios",
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

  onFileSelected(image) {
    this.form.patchValue({
      imgUrl: image.webPath
    });
    this.selectedImage = image;
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
        const data = {
          ...this.form.value,
          categoryId: this.form.value.category,
          locationId: this.form.value.location
        };
        delete data.category;
        delete data.location;
        this.stuffService
          .addStuff(data, this.selectedImage)
          .pipe(
            switchMap(newId => {
              return combineLatest([
                this.categoryService.loadCategories(),
                this.locationService.loadLocations()
              ]).pipe(map(() => newId));
            })
          )
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
                id: newId,
                name: this.form.value.name,
                expiryDate: this.form.value.expiryDate
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
