import { Component, OnInit, OnDestroy } from "@angular/core";
import { LocationService } from "../location.service";
import { Subscription } from "rxjs";
import { Location } from "../location.model";
import {
  ModalController,
  AlertController,
  IonItemSliding
} from "@ionic/angular";
import { AddLocationModalComponent } from "../add-location-modal/add-location-modal.component";

@Component({
  selector: "app-location-list",
  templateUrl: "./location-list.page.html",
  styleUrls: ["./location-list.page.scss"]
})
export class LocationListPage implements OnInit, OnDestroy {
  private locationSub: Subscription;
  locations: Location[];

  constructor(
    private locationService: LocationService,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.locationSub = this.locationService.locations.subscribe(locations => {
      this.locations = locations;
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
              this.locationService.deleteLocation(id).subscribe();
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
