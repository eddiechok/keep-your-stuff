import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AddImageSvgComponent } from "./add-image-svg/add-image-svg.component";
import { SearchSvgComponent } from "./search-svg/search-svg.component";
import { NoRecordSvgComponent } from "./no-record-svg/no-record-svg.component";

@NgModule({
  declarations: [
    AddImageSvgComponent,
    SearchSvgComponent,
    NoRecordSvgComponent
  ],
  imports: [CommonModule],
  exports: [AddImageSvgComponent, SearchSvgComponent, NoRecordSvgComponent]
})
export class SvgModule {}
