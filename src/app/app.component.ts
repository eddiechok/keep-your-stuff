import { Component, NgZone } from "@angular/core";

import { Platform } from "@ionic/angular";
import { SplashScreen } from "@ionic-native/splash-screen/ngx";
import { StatusBar } from "@ionic-native/status-bar/ngx";
import { Plugins } from "@capacitor/core";
import { Router } from "@angular/router";
import { NotificationService } from "./shared/services/notification.service";

@Component({
  selector: "app-root",
  templateUrl: "app.component.html",
  styleUrls: ["app.component.scss"]
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private router: Router,
    private ngZone: NgZone,
    private notificationService: NotificationService
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.notificationService.initialize();

      // set dark mode
      Plugins.Storage.get({ key: "isDarkMode" }).then(data => {
        const isDarkMode = !!JSON.parse(data.value);
        document.body.classList.toggle("dark", isDarkMode);
      });
    });
  }
}
