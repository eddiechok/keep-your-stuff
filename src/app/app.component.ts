import { AdMob } from "@admob-plus/ionic/ngx";
import { Component } from "@angular/core";
import { Plugins } from "@capacitor/core";
import { SplashScreen } from "@ionic-native/splash-screen/ngx";
import { StatusBar } from "@ionic-native/status-bar/ngx";
import { Platform } from "@ionic/angular";
import { environment } from "src/environments/environment";
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
    private notificationService: NotificationService,
    private admob: AdMob
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(async () => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.notificationService.initialize();

      // set dark mode
      Plugins.Storage.get({ key: "isDarkMode" }).then(data => {
        const isDarkMode = !!JSON.parse(data.value);
        document.body.classList.toggle("dark", isDarkMode);
      });

      // initialize app
      if (this.platform.is("cordova")) {
        await this.admob.start();
        const interstitial = new this.admob.InterstitialAd({
          adUnitId: environment.adUnitID
        });
        await interstitial.load();
        await interstitial.show();

        // const banner = new this.admob.BannerAd({
        //   adUnitId: "ca-app-pub-3940256099942544/6300978111"
        // });
        // await banner.show();
      }
    });
  }
}
