import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { BackupPageRoutingModule } from "./backup-routing.module";

import { BackupPage } from "./backup.page";
import { SharedModule } from "src/app/shared/shared.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BackupPageRoutingModule,
    SharedModule
  ],
  declarations: [BackupPage]
})
export class BackupPageModule {}
