import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { StuffByTypePageRoutingModule } from "./stuff-by-type-routing.module";

import { StuffByTypePage } from "./stuff-by-type.page";
import { SharedModule } from "src/app/shared/shared.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StuffByTypePageRoutingModule,
    SharedModule
  ],
  declarations: [StuffByTypePage]
})
export class StuffByTypePageModule {}
