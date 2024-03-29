import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import {
  LoadingController,
  ModalController,
  NavController,
  PickerController
} from "@ionic/angular";
import { PickerColumnOption } from "@ionic/core";
import { Subscription, zip, combineLatest } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import { AddCategoryModalComponent } from "../../category/add-category-modal/add-category-modal.component";
import { Category } from "../../category/category.model";
import { CategoryService } from "../../category/category.service";
import { AddLocationModalComponent } from "../../location/add-location-modal/add-location-modal.component";
import { Location } from "../../location/location.model";
import { LocationService } from "../../location/location.service";
import { StuffService } from "../stuff.service";
import { NotificationService } from "src/app/shared/services/notification.service";
import { Stuff } from "../stuff.model";
import { CameraPhoto } from "@capacitor/core";
import { SettingService } from "../../setting/setting.service";

@Component({
  selector: "app-edit-stuff",
  templateUrl: "./edit-stuff.page.html",
  styleUrls: ["./edit-stuff.page.scss"]
})
export class EditStuffPage implements OnInit, OnDestroy {
  form = this.fb.group({
    name: [null, Validators.required],
    desc: [null],
    imgUrl: [null],
    category: [null, Validators.required],
    location: [null, Validators.required],
    expiryDate: [null],
    quantity: [null],
    price: [null]
  });
  isLoading = false;
  selected = {
    category: "",
    location: ""
  };
  editingStuff: Stuff;
  currency = "";
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
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private notificationService: NotificationService,
    private settingService: SettingService
  ) {}

  ngOnInit() {
    this.isLoading = true;

    // get currency
    this.settingService.currency.then(currency => {
      this.currency = currency;
    });

    const stuffObs$ = this.route.paramMap.pipe(
      map(paramMap => {
        if (!paramMap.has("id")) {
          this.navCtrl.back();
          throw new Error("no id");
        }
        const id = +paramMap.get("id");
        return id;
      }),
      switchMap(id => {
        return this.stuffService.getStuff(id);
      })
    );

    this.sub = combineLatest([
      this.categoryService.categories,
      this.locationService.locations,
      stuffObs$
    ]).subscribe(
      ([categories, locations, stuff]) => {
        this.editingStuff = { ...stuff };
        this.categories = [...categories];
        this.locations = [...locations];
        this.form.patchValue({
          name: stuff.name,
          desc: stuff.desc,
          imgUrl: stuff.imgUrl,
          category: stuff.categoryId,
          location: stuff.locationId,
          expiryDate: stuff.expiryDate,
          quantity: stuff.quantity,
          price: stuff.price
        });
        this.selected.category = this.categories.find(
          category => category.id === stuff.categoryId
        ).name;
        this.selected.location = this.locations.find(
          location => location.id === stuff.locationId
        ).name;
        this.isLoading = false;
      },
      err => {
        console.log(err);
        this.navCtrl.navigateBack("/home");
        this.isLoading = false;
      }
    );
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
            this.form.markAsDirty();
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
    this.form.markAsDirty();
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // navigate back if user didnt change anything
    if (!this.form.dirty) {
      this.navCtrl.navigateBack("/stuff/" + this.editingStuff.id);
      return;
    }

    this.loadingCtrl
      .create({
        message: "Updating..."
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
          .updateStuff(this.editingStuff.id, data, this.selectedImage)
          .pipe(
            switchMap(() => {
              return combineLatest([
                this.categoryService.loadCategories(),
                this.locationService.loadLocations()
              ]);
            })
          )
          .subscribe(() => {
            // schedule notifications if expiry date or name has changed
            if (
              this.editingStuff.expiryDate !== this.form.value.expiryDate ||
              this.editingStuff.name !== this.form.value.name
            ) {
              this.notificationService.rescheduleNotification({
                id: this.editingStuff.id,
                name: this.form.value.name,
                expiryDate: this.form.value.expiryDate
              });
            }

            loadingEl.dismiss();
            this.form.reset();
            this.selected = {
              category: "",
              location: ""
            };
            this.navCtrl.navigateBack("/stuff/" + this.editingStuff.id);
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
