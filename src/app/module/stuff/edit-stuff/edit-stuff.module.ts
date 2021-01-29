import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { SharedModule } from "src/app/shared/shared.module";
import { EditStuffPageRoutingModule } from "./edit-stuff-routing.module";
import { EditStuffPage } from "./edit-stuff.page";

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    EditStuffPageRoutingModule,
    ReactiveFormsModule,
    SharedModule
  ],
  declarations: [EditStuffPage]
})
export class EditStuffPageModule {}
