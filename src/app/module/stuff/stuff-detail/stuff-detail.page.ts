import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import {
  AlertController,
  LoadingController,
  NavController
} from "@ionic/angular";
import { combineLatest, Subscription } from "rxjs";
import {
  switchMap,
  distinctUntilChanged,
  map,
  throwIfEmpty
} from "rxjs/operators";
import { CategoryService } from "../../category/category.service";
import { LocationService } from "../../location/location.service";
import { SettingService } from "../../setting/setting.service";
import { StuffWithRelations } from "../stuff.model";
import { StuffService } from "../stuff.service";

@Component({
  selector: "app-stuff-detail",
  templateUrl: "./stuff-detail.page.html",
  styleUrls: ["./stuff-detail.page.scss"]
})
export class StuffDetailPage implements OnInit, OnDestroy {
  stuff: StuffWithRelations;
  isLoading = false;
  currency = "";
  private sub: Subscription;

  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private stuffService: StuffService,
    private categoryService: CategoryService,
    private locationService: LocationService,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private settingService: SettingService
  ) {}

  ngOnInit() {
    //get currency
    this.settingService.currency.then(currency => {
      this.currency = currency;
    });

    this.route.paramMap
      .pipe(
        map(paramMap => {
          if (!paramMap.has("id")) {
            this.navCtrl.back();
            return;
          }
          return +paramMap.get("id");
        }),
        throwIfEmpty(),
        distinctUntilChanged()
      )
      .subscribe(id => {
        this.isLoading = true;
        this.sub = this.stuffService
          .getStuff(id)
          .pipe(
            switchMap(stuff => {
              console.log("stuff detail: stuff");
              return combineLatest([
                this.categoryService.getCategory(stuff.categoryId),
                this.locationService.getLocation(stuff.locationId)
              ]).pipe(
                map(([category, location]) => {
                  console.log("stuff detail: category and location");
                  const newStuff: StuffWithRelations = {
                    ...stuff,
                    category: category,
                    location: location
                  };
                  return newStuff;
                })
              );
            })
          )
          .subscribe(
            stuff => {
              this.stuff = stuff;
              this.isLoading = false;
            },
            error => {
              this.isLoading = false;
            }
          );
      });
  }

  onDelete() {
    this.alertCtrl
      .create({
        header: "Confirm to delete?",
        message: "Deleted data cannot be reverted.",
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
                  this.stuffService
                    .deleteStuff(this.stuff.id)
                    .pipe(
                      switchMap(() =>
                        combineLatest([
                          this.categoryService.loadCategories(),
                          this.locationService.loadLocations()
                        ])
                      )
                    )
                    .subscribe(() => {
                      el.dismiss();
                      this.navCtrl.back();
                    });
                });
            }
          }
        ]
      })
      .then(el => {
        el.present();
      });
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }
}
