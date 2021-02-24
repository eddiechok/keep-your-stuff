import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { SharedModule } from "src/app/shared/shared.module";
import { SigninPageRoutingModule } from "./signin-routing.module";
import { SigninPage } from "./signin.page";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SigninPageRoutingModule,
    SharedModule
  ],
  declarations: [SigninPage]
})
export class SigninPageModule {}
