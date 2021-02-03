import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { SharedModule } from "src/app/shared/shared.module";
import { AddStuffPageRoutingModule } from "./add-stuff-routing.module";
import { AddStuffPage } from "./add-stuff.page";

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    AddStuffPageRoutingModule,
    ReactiveFormsModule,
    SharedModule,
    FormsModule
  ],
  declarations: [AddStuffPage]
})
export class AddStuffPageModule {}
