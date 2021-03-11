import { Injectable } from "@angular/core";
import { Plugins } from "@capacitor/core";

@Injectable({
  providedIn: "root"
})
export class SettingService {
  constructor() {}

  get currency() {
    return Plugins.Storage.get({ key: "currency" }).then(data => data.value);
  }

  setCurrency(currency: string) {
    Plugins.Storage.set({ key: "currency", value: currency });
  }
}
