import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { StuffByTypePage } from "./stuff-by-type.page";

const routes: Routes = [
  {
    path: "",
    component: StuffByTypePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StuffByTypePageRoutingModule {}
