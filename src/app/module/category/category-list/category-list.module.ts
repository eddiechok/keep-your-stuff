import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { SharedModule } from "src/app/shared/shared.module";
import { CategoryListPageRoutingModule } from "./category-list-routing.module";
import { CategoryListPage } from "./category-list.page";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CategoryListPageRoutingModule,
    SharedModule
  ],
  declarations: [CategoryListPage]
})
export class CategoryListPageModule {}
