import { Directive, ElementRef, OnInit, Self } from "@angular/core";
import { fromEvent, Subject, merge } from "rxjs";
import { shareReplay } from "rxjs/operators";
import { FormGroupDirective } from "@angular/forms";

@Directive({
  selector: "form"
})
export class FormSubmitDirective implements OnInit {
  private _markAllAsTouched$ = new Subject<any>();
  isAllTouched = false;

  // combine form submit event and manual submit event triggered by markAllAsTouched
  // submit$ = merge(fromEvent(this.element, "submit"), this.manualSubmit$).pipe(
  //   shareReplay(1)
  // );

  constructor(
    private host: ElementRef<HTMLFormElement>,
    private formGroup: FormGroupDirective
  ) {}

  ngOnInit() {
    // emit observable if markAllAsTouched is called
    const _markAllAsTouched = this.formGroup.form.markAllAsTouched.bind(
      this.formGroup.form
    );
    this.formGroup.form.markAllAsTouched = () => {
      if (!this.isAllTouched) {
        _markAllAsTouched();
        this._markAllAsTouched$.next();
        this.isAllTouched = true;
      }
    };

    // set isAllTouched to false if form is reset
    const _reset = this.formGroup.form.reset.bind(this.formGroup.form);
    this.formGroup.form.reset = () => {
      _reset();
      this.isAllTouched = false;
    };
  }

  get element() {
    return this.host.nativeElement;
  }

  get markAllAsTouched$() {
    return this._markAllAsTouched$.asObservable();
  }
}
