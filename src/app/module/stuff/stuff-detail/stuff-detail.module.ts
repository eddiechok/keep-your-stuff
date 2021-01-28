import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { SharedModule } from "src/app/shared/shared.module";
import { StuffDetailPageRoutingModule } from "./stuff-detail-routing.module";
import { StuffDetailPage } from "./stuff-detail.page";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StuffDetailPageRoutingModule,
    SharedModule
  ],
  declarations: [StuffDetailPage]
})
export class StuffDetailPageModule {}
