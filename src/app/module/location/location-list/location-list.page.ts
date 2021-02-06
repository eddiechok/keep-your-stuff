import { Component, OnDestroy, OnInit } from "@angular/core";
import {
  AlertController,
  IonItemSliding,
  LoadingController,
  ModalController,
  ToastController
} from "@ionic/angular";
import { Subscription } from "rxjs";
import { AddLocationModalComponent } from "../add-location-modal/add-location-modal.component";
import { Location } from "../location.model";
import { LocationService } from "../location.service";

@Component({
  selector: "app-location-list",
  templateUrl: "./location-list.page.html",
  styleUrls: ["./location-list.page.scss"]
})
export class LocationListPage implements OnInit, OnDestroy {
  private locationSub: Subscription;
  locations: Location[];
  isLoading = false;

  constructor(
    private locationService: LocationService,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.isLoading = true;
    this.locationSub = this.locationService.locations.subscribe(locations => {
      this.locations = locations;
      this.isLoading = false;
    });
  }

  ngOnDestroy() {
    if (this.locationSub) this.locationSub.unsubscribe();
  }

  onAddLocation() {
    this.modalCtrl
      .create({
        component: AddLocationModalComponent
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
        message: "Deleted location cannot be reverted.",
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
                  this.locationService.deleteLocation(id).subscribe(
                    () => {
                      el.dismiss();
                    },
                    err => {
                      let errorMsg: string;
                      if (err === "stuffs_not_empty") {
                        errorMsg =
                          "There are still stuffs in this location. Please remove all the stuffs in it before deleting.";
                      } else if (err === "not_found") {
                        errorMsg = "Location not found. Please try again";
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
        component: AddLocationModalComponent,
        componentProps: {
          id
        }
      })
      .then(el => {
        el.present();
      });
  }
}
