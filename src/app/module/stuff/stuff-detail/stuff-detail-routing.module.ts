import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StuffDetailPage } from './stuff-detail.page';

const routes: Routes = [
  {
    path: '',
    component: StuffDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StuffDetailPageRoutingModule {}
