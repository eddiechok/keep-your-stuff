import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { SigninGuard } from "./signin.guard";

import { SigninPage } from "./signin.page";

const routes: Routes = [
  {
    path: "",
    component: SigninPage,
    canActivate: [SigninGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SigninPageRoutingModule {}
