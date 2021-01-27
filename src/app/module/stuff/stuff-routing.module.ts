import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

const routes: Routes = [
  // {
  //   path: "search",
  //   loadChildren: () =>
  //     import("./search-stuff/search-stuff.module").then(
  //       m => m.SearchStuffPageModule
  //     )
  // },
  // {
  //   path: "",
  //   redirectTo: "search",
  //   pathMatch: "full"
  // },
  {
    path: "by-category/:id",
    loadChildren: () =>
      import("./stuff-by-category/stuff-by-category.module").then(
        m => m.StuffByCategoryPageModule
      )
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StuffRoutingModule {}
