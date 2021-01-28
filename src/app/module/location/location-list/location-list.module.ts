import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { SharedModule } from "src/app/shared/shared.module";
import { LocationListPageRoutingModule } from "./location-list-routing.module";
import { LocationListPage } from "./location-list.page";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LocationListPageRoutingModule,
    SharedModule
  ],
  declarations: [LocationListPage]
})
export class LocationListPageModule {}
