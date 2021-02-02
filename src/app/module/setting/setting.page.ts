import { Component, OnInit } from "@angular/core";
import { Plugins } from "@capacitor/core";

@Component({
  selector: "app-setting",
  templateUrl: "./setting.page.html",
  styleUrls: ["./setting.page.scss"]
})
export class SettingPage implements OnInit {
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
    }
  ];
  isDarkMode = false;

  constructor() {}

  async ngOnInit() {
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
}
