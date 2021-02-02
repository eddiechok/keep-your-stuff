import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { AddStuffPage } from "./add-stuff.page";
import { StuffGuard } from "../stuff.guard";

const routes: Routes = [
  {
    path: "",
    component: AddStuffPage,
    canDeactivate: [StuffGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AddStuffPageRoutingModule {}
