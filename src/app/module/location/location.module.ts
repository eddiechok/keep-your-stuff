import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { LocationRoutingModule } from "./location-routing.module";
import { ReactiveFormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { AddLocationModalComponent } from "./add-location-modal/add-location-modal.component";
import { SharedModule } from "src/app/shared/shared.module";

@NgModule({
  declarations: [AddLocationModalComponent],
  imports: [
    CommonModule,
    LocationRoutingModule,
    ReactiveFormsModule,
    IonicModule,
    SharedModule
  ]
})
export class LocationModule {}
