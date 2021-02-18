import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { BackupGuard } from "./backup.guard";

import { BackupPage } from "./backup.page";

const routes: Routes = [
  {
    path: "",
    component: BackupPage,
    canActivate: [BackupGuard]
  },
  {
    path: "signin",
    loadChildren: () =>
      import("./signin/signin.module").then(m => m.SigninPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BackupPageRoutingModule {}
