import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { TabsPage } from "./tabs.page";

const routes: Routes = [
  {
    path: "",
    component: TabsPage,
    children: [
      {
        path: "home",
        loadChildren: () =>
          import("../module/home/home.module").then(m => m.HomePageModule)
      },
      {
        path: "search-stuff",
        loadChildren: () =>
          import("../module/stuff/search-stuff/search-stuff.module").then(
            m => m.SearchStuffPageModule
          )
      },
      {
        path: "setting",
        loadChildren: () =>
          import("../module/setting/setting.module").then(
            m => m.SettingPageModule
          )
      },
      {
        path: "",
        redirectTo: "/home",
        pathMatch: "full"
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule {}
