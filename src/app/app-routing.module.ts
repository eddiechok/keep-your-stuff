import { NgModule } from "@angular/core";
import { PreloadAllModules, RouterModule, Routes } from "@angular/router";

const routes: Routes = [
  {
    path: "category",
    loadChildren: () =>
      import("./module/category/category.module").then(m => m.CategoryModule)
  },
  {
    path: "location",
    loadChildren: () =>
      import("./module/location/location.module").then(m => m.LocationModule)
  },
  {
    path: "stuff",
    loadChildren: () =>
      import("./module/stuff/stuff.module").then(m => m.StuffModule)
  },
  {
    path: "",
    loadChildren: () => import("./tabs/tabs.module").then(m => m.TabsPageModule)
  },
  {
    path: "reminder",
    loadChildren: () =>
      import("./module/reminder/reminder.module").then(
        m => m.ReminderPageModule
      )
  },
  {
    path: "backup",
    loadChildren: () =>
      import("./module/backup/backup.module").then(m => m.BackupPageModule)
  }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules,
      relativeLinkResolution: "corrected"
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
