import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { IonicModule } from "@ionic/angular";
import { NoRecordComponent } from "./components/no-record/no-record.component";
import { SkeletonListComponent } from "./components/skeleton/skeleton-list/skeleton-list.component";
import { SpinnerComponent } from "./components/spinner/spinner.component";
import { SearchSvgComponent } from "./components/search-svg/search-svg.component";

@NgModule({
  declarations: [
    SpinnerComponent,
    SkeletonListComponent,
    NoRecordComponent,
    SearchSvgComponent
  ],
  imports: [CommonModule, IonicModule],
  exports: [
    SpinnerComponent,
    SkeletonListComponent,
    NoRecordComponent,
    SearchSvgComponent
  ]
})
export class SharedModule {}
