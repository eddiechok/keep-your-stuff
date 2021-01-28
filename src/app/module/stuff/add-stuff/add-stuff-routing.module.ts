import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddStuffPage } from './add-stuff.page';

const routes: Routes = [
  {
    path: '',
    component: AddStuffPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddStuffPageRoutingModule {}
