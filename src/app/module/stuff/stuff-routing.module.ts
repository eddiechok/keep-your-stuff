import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { StuffGuard } from "./stuff.guard";

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
    path: "by/:type/:id",
    loadChildren: () =>
      import("./stuff-by-type/stuff-by-type.module").then(
        m => m.StuffByTypePageModule
      )
  },
  {
    path: "add",
    loadChildren: () =>
      import("./add-stuff/add-stuff.module").then(m => m.AddStuffPageModule)
  },
  {
    path: "add/:type/:id",
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
