import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { CategoryRoutingModule } from "./category-routing.module";
import { AddCategoryModalComponent } from "./add-category-modal/add-category-modal.component";
import { IonicModule } from "@ionic/angular";
import { ReactiveFormsModule } from "@angular/forms";

@NgModule({
  declarations: [AddCategoryModalComponent],
  imports: [
    CommonModule,
    CategoryRoutingModule,
    IonicModule,
    ReactiveFormsModule
  ],
  entryComponents: [AddCategoryModalComponent]
})
export class CategoryModule {}
