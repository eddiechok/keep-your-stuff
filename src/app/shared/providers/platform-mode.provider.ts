import { Injectable, InjectionToken } from "@angular/core";
import { Platform } from "@ionic/angular";

@Injectable({
  providedIn: "root"
})
export class PlatformModeService {
  mode: "ios" | "md";

  constructor(private platform: Platform) {
    if (this.platform.is("ios")) {
      this.mode = "ios";
    } else {
      this.mode = "md";
    }
  }
}
