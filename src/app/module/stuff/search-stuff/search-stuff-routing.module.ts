import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SearchStuffPage } from './search-stuff.page';

const routes: Routes = [
  {
    path: '',
    component: SearchStuffPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SearchStuffPageRoutingModule {}
