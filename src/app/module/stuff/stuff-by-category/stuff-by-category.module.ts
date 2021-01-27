import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StuffByCategoryPageRoutingModule } from './stuff-by-category-routing.module';

import { StuffByCategoryPage } from './stuff-by-category.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StuffByCategoryPageRoutingModule
  ],
  declarations: [StuffByCategoryPage]
})
export class StuffByCategoryPageModule {}
