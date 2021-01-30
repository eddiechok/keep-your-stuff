import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { IonicModule } from "@ionic/angular";
import { NoRecordComponent } from "./components/no-record/no-record.component";
import { SkeletonListComponent } from "./components/skeleton/skeleton-list/skeleton-list.component";
import { SpinnerComponent } from "./components/spinner/spinner.component";
import { SearchSvgComponent } from "./components/search-svg/search-svg.component";
import { ImageInputComponent } from "./components/image-input/image-input.component";
import { SvgModule } from "./svg/svg.module";
import { ImageViewerComponent } from "./components/image-viewer/image-viewer.component";

@NgModule({
  declarations: [
    SpinnerComponent,
    SkeletonListComponent,
    NoRecordComponent,
    SearchSvgComponent,
    ImageInputComponent,
    ImageViewerComponent
  ],
  imports: [CommonModule, IonicModule, SvgModule],
  exports: [
    SpinnerComponent,
    SkeletonListComponent,
    NoRecordComponent,
    SearchSvgComponent,
    ImageInputComponent,
    ImageViewerComponent
  ]
})
export class SharedModule {}
