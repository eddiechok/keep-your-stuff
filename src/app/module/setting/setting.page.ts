import { Component, OnInit } from "@angular/core";

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
    }
  ];

  constructor() {}

  ngOnInit() {}
}
