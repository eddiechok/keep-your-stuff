import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { LocationListPageRoutingModule } from "./location-list-routing.module";

import { LocationListPage } from "./location-list.page";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LocationListPageRoutingModule
  ],
  declarations: [LocationListPage]
})
export class LocationListPageModule {}
