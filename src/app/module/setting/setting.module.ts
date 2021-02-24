import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { SharedModule } from "src/app/shared/shared.module";
import { SettingPageRoutingModule } from "./setting-routing.module";
import { SettingPage } from "./setting.page";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SettingPageRoutingModule,
    SharedModule
  ],
  declarations: [SettingPage]
})
export class SettingPageModule {}
