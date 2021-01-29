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
  {
    path: "",
    redirectTo: "/search-stuff",
    pathMatch: "full"
  },
  {
    path: "by-category/:id",
    loadChildren: () =>
      import("./stuff-by-category/stuff-by-category.module").then(
        m => m.StuffByCategoryPageModule
      )
  },
  {
    path: "add",
    loadChildren: () =>
      import("./add-stuff/add-stuff.module").then(m => m.AddStuffPageModule)
  },
  {
    path: ":id/edit",
    loadChildren: () =>
      import("./edit-stuff/edit-stuff.module").then(m => m.EditStuffPageModule)
  },
  {
    path: ":id",
    loadChildren: () =>
      import("./stuff-detail/stuff-detail.module").then(
        m => m.StuffDetailPageModule
      )
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StuffRoutingModule {}
