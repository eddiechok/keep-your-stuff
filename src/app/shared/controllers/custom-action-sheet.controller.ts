import { Injectable } from "@angular/core";
import { ActionSheetController } from "@ionic/angular";
import { ActionSheetOptions } from "@ionic/core";
import { PlatformModeService } from "../providers/platform-mode.provider";

@Injectable({
  providedIn: "root"
})
export class CustomActionSheetController extends ActionSheetController {
  constructor(private platformMode: PlatformModeService) {
    super();
  }

  create(opts?: ActionSheetOptions): Promise<HTMLIonActionSheetElement> {
    return super.create({
      mode: this.platformMode.mode,
      ...opts
    });
  }
}
