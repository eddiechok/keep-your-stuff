import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { DatetimeWrapperComponent } from "./components/datetime-wrapper/datetime-wrapper.component";
import { ImageInputComponent } from "./components/image-input/image-input.component";
import { ImageViewerComponent } from "./components/image-viewer/image-viewer.component";
import { NoRecordComponent } from "./components/no-record/no-record.component";
import { SearchSvgComponent } from "./components/search-svg/search-svg.component";
import { SkeletonListComponent } from "./components/skeleton/skeleton-list/skeleton-list.component";
import { SpinnerComponent } from "./components/spinner/spinner.component";
import { DefaultImageDirective } from "./directives/default-image.directive";
import { SvgModule } from "./svg/svg.module";
import { ControlErrorsDirective } from "./directives/control-errors.directive";
import { FormSubmitDirective } from "./directives/form-submit.directive";
import { ControlErrorComponent } from "./components/control-error/control-error.component";
import { ControlErrorContainerDirective } from "./directives/control-error-container.directive";
import { SafeUrlPipe } from "./pipes/safeUrl.pipe";

@NgModule({
  declarations: [
    SpinnerComponent,
    SkeletonListComponent,
    NoRecordComponent,
    SearchSvgComponent,
    ImageInputComponent,
    ImageViewerComponent,
    DefaultImageDirective,
    DatetimeWrapperComponent,
    ControlErrorsDirective,
    FormSubmitDirective,
    ControlErrorComponent,
    ControlErrorContainerDirective,
    SafeUrlPipe
  ],
  imports: [
    CommonModule,
    IonicModule,
    SvgModule,
    ReactiveFormsModule,
    FormsModule
  ],
  exports: [
    SpinnerComponent,
    SkeletonListComponent,
    NoRecordComponent,
    SearchSvgComponent,
    ImageInputComponent,
    ImageViewerComponent,
    DefaultImageDirective,
    DatetimeWrapperComponent,
    ControlErrorContainerDirective,
    ControlErrorsDirective,
    FormSubmitDirective,
    ControlErrorContainerDirective,
    SafeUrlPipe
  ]
})
export class SharedModule {}
