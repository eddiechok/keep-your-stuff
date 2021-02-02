import { Injectable } from "@angular/core";
import {
  CanDeactivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree
} from "@angular/router";
import { AddStuffPage } from "./add-stuff/add-stuff.page";
import { AlertController } from "@ionic/angular";

@Injectable({
  providedIn: "root"
})
export class StuffGuard implements CanDeactivate<unknown> {
  constructor(private alertCtrl: AlertController) {}

  async canDeactivate(
    component: AddStuffPage,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot
  ): Promise<boolean | UrlTree> {
    if (!component.canDeactivate()) {
      const alertEl = await this.alertCtrl.create({
        header: "Confirm to leave?",
        message: "Your information will not be saved.",
        buttons: [
          {
            text: "Cancel",
            role: "cancel"
          },
          {
            text: "Leave",
            role: "confirm"
          }
        ]
      });

      alertEl.present();
      const eventDetail = await alertEl.onDidDismiss();
      return eventDetail.role === "confirm";
    }
    return true;
  }
}
