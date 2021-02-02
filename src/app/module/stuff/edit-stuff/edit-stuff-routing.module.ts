import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { StuffGuard } from "../stuff.guard";
import { EditStuffPage } from "./edit-stuff.page";

const routes: Routes = [
  {
    path: "",
    component: EditStuffPage,
    canDeactivate: [StuffGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EditStuffPageRoutingModule {}
