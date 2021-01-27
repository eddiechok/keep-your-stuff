import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StuffByCategoryPage } from './stuff-by-category.page';

const routes: Routes = [
  {
    path: '',
    component: StuffByCategoryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StuffByCategoryPageRoutingModule {}
