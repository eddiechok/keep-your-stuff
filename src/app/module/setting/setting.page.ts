import { Component, OnInit } from "@angular/core";
import { Plugins } from "@capacitor/core";
import { AlertController } from "@ionic/angular";
import { SettingService } from "./setting.service";

@Component({
  selector: "app-setting",
  templateUrl: "./setting.page.html",
  styleUrls: ["./setting.page.scss"]
})
export class SettingPage implements OnInit {
  currency = "";
  menus = [
    {
      id: 1,
      name: "Category",
      icon: "list-outline",
      routerLink: "/category/list"
    },
    {
      id: 2,
      name: "Location",
      icon: "location-outline",
      routerLink: "/location/list"
    },
    {
      id: 3,
      name: "Exipration Reminder",
      icon: "notifications-outline",
      routerLink: "/reminder"
    },
    {
      id: 4,
      name: "Backup & Restore",
      icon: "server-outline",
      routerLink: "/backup"
    }
  ];
  isDarkMode = false;

  constructor(
    private settingService: SettingService,
    private alertCtrl: AlertController
  ) {}

  async ngOnInit() {
    this.settingService.currency.then(currency => {
      this.currency = currency || "USD";
    });
    const darkMode = await Plugins.Storage.get({ key: "isDarkMode" });
    this.isDarkMode = !!JSON.parse(darkMode.value);
  }

  onToggleDarkMode() {
    document.body.classList.toggle("dark", this.isDarkMode);
    Plugins.Storage.set({
      key: "isDarkMode",
      value: this.isDarkMode.toString()
    });
  }

  async showEditCurrencyModal() {
    const alert = await this.alertCtrl.create({
      header: "Currency Unit",
      inputs: [
        {
          name: "currency",
          value: this.currency
        }
      ],
      buttons: [
        {
          text: "Cancel",
          role: "cancel"
        },
        {
          text: "OK",
          handler: data => {
            this.currency = data.currency;
            this.settingService.setCurrency(data.currency);
          }
        }
      ]
    });
    alert.present();
  }
}
