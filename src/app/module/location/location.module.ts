import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { LocationRoutingModule } from "./location-routing.module";
import { ReactiveFormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { AddLocationModalComponent } from "./add-location-modal/add-location-modal.component";

@NgModule({
  declarations: [AddLocationModalComponent],
  imports: [
    CommonModule,
    LocationRoutingModule,
    ReactiveFormsModule,
    IonicModule
  ],
  entryComponents: [AddLocationModalComponent]
})
export class LocationModule {}
