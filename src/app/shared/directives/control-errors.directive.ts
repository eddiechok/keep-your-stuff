import {
  ComponentFactoryResolver,
  ComponentRef,
  Directive,
  Host,
  Inject,
  OnDestroy,
  OnInit,
  Optional,
  Self,
  ViewContainerRef
} from "@angular/core";
import { NgControl } from "@angular/forms";
import { EMPTY, merge, Observable, ReplaySubject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { ControlErrorComponent } from "../components/control-error/control-error.component";
import { FormErrors, FORM_ERRORS } from "../providers/form-errors.provider";
import { ControlErrorContainerDirective } from "./control-error-container.directive";
import { FormSubmitDirective } from "./form-submit.directive";

@Directive({
  selector: "[formControl], [formControlName]"
})
export class ControlErrorsDirective implements OnInit, OnDestroy {
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  private submit$: Observable<Event>;
  private container: ViewContainerRef;
  ref: ComponentRef<ControlErrorComponent>;

  constructor(
    @Self() private control: NgControl,
    @Inject(FORM_ERRORS) private errors: FormErrors,
    @Optional() @Host() private form: FormSubmitDirective,
    private vcr: ViewContainerRef,
    private resolver: ComponentFactoryResolver,
    @Optional() private controlErrorContainer: ControlErrorContainerDirective
  ) {
    // if doesnt have form selectors at parent level, return empty observable
    this.submit$ = this.form ? this.form.markAllAsTouched$ : EMPTY;
    this.container = this.controlErrorContainer
      ? this.controlErrorContainer.vcr
      : this.vcr;
  }

  ngOnInit() {
    merge(this.submit$, this.control.valueChanges)
      .pipe(takeUntil(this.destroyed$)) // cancel the subscription after the component is destroyed
      .subscribe(() => {
        const { touched, errors, dirty } = this.control;
        if (errors && (touched || dirty)) {
          const firstKey = Object.keys(errors)[0]; // get the firstKey in control errors
          const getError = this.errors[firstKey]; // map the key with FORM_ERRORS
          const text = getError(errors[firstKey]); // get the error messages

          this.setError(text);
        } else {
          this.setError(null);
        }
      });
  }

  setError(text: string) {
    if (!this.ref) {
      // create control error component for the first time
      // insert next to the current component
      const factory = this.resolver.resolveComponentFactory(
        ControlErrorComponent
      );
      this.ref = this.container.createComponent(factory);
    }

    this.ref.instance.text = text;
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
