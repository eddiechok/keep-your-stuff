import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { CategoryRoutingModule } from "./category-routing.module";
import { AddCategoryModalComponent } from "./add-category-modal/add-category-modal.component";
import { IonicModule } from "@ionic/angular";
import { ReactiveFormsModule } from "@angular/forms";
import { SharedModule } from "src/app/shared/shared.module";

@NgModule({
  declarations: [AddCategoryModalComponent],
  imports: [
    CommonModule,
    CategoryRoutingModule,
    IonicModule,
    ReactiveFormsModule,
    SharedModule
  ],
  entryComponents: [AddCategoryModalComponent]
})
export class CategoryModule {}
