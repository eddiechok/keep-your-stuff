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
import { Subscription, zip } from "rxjs";
import { switchMap } from "rxjs/operators";
import { AddCategoryModalComponent } from "../../category/add-category-modal/add-category-modal.component";
import { Category } from "../../category/category.model";
import { CategoryService } from "../../category/category.service";
import { AddLocationModalComponent } from "../../location/add-location-modal/add-location-modal.component";
import { Location } from "../../location/location.model";
import { LocationService } from "../../location/location.service";
import { StuffService } from "../stuff.service";

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
    location: [null, Validators.required]
  });
  isLoading = false;
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
    private router: Router
  ) {}

  ngOnInit() {
    this.sub = zip(
      this.categoryService.categories,
      this.locationService.locations
    ).subscribe(data => {
      this.categories = [...data[0]];
      this.locations = [...data[1]];
      this.isLoading = false;
    });
  }

  async openPicker(name: string, data: { id: number; name: string }[]) {
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

    await picker.present();
  }

  onSelectCategory() {
    this.openPicker("category", this.categories);
  }

  onSelectLocation() {
    this.openPicker("location", this.locations);
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
          });
      });
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }
}
