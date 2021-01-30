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
    location: [null, Validators.required]
  });
  isLoading = false;
  selected = {
    category: "",
    location: ""
  };
  stuffId: number;
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
    private route: ActivatedRoute,
    private navCtrl: NavController
  ) {}

  ngOnInit() {
    this.isLoading = true;

    const stuffObs$ = this.route.paramMap.pipe(
      map(paramMap => {
        if (!paramMap.has("id")) {
          this.navCtrl.back();
          throw new Error("no id");
        }
        this.stuffId = +paramMap.get("id");
        return this.stuffId;
      }),
      switchMap(id => {
        return this.stuffService.getStuff(id);
      })
    );

    this.sub = combineLatest(
      this.categoryService.categories,
      this.locationService.locations,
      stuffObs$
    ).subscribe(
      ([categories, locations, stuff]) => {
        this.categories = [...categories];
        this.locations = [...locations];
        this.form.patchValue({
          name: stuff.name,
          desc: stuff.desc,
          imgUrl: stuff.imgUrl,
          category: stuff.categoryId,
          location: stuff.locationId
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
        message: "Updating..."
      })
      .then(loadingEl => {
        loadingEl.present();
        this.stuffService
          .updateStuff({
            ...this.form.value,
            categoryId: this.form.value.category,
            locationId: this.form.value.location,
            id: this.stuffId
          })
          .subscribe(() => {
            loadingEl.dismiss();
            this.form.reset();
            this.selected = {
              category: "",
              location: ""
            };
            this.navCtrl.back();
          });
      });
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }
}
