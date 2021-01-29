import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EditStuffPage } from './edit-stuff.page';

const routes: Routes = [
  {
    path: '',
    component: EditStuffPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditStuffPageRoutingModule {}
