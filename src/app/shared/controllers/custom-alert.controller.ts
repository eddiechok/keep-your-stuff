import { Injectable } from "@angular/core";
import { AlertOptions } from "@capacitor/core";
import { AlertController } from "@ionic/angular";
import { PlatformModeService } from "../providers/platform-mode.provider";

@Injectable({
  providedIn: "root"
})
export class CustomAlertController extends AlertController {
  constructor(private platformMode: PlatformModeService) {
    super();
  }

  create(opts?: AlertOptions): Promise<HTMLIonAlertElement> {
    return super.create({
      mode: this.platformMode.mode,
      ...opts
    });
  }
}
