import {
  Component,
  OnDestroy,
  ContentChild,
  AfterContentInit
} from "@angular/core";
import { FormControlName } from "@angular/forms";
import { Subscription } from "rxjs";

@Component({
  selector: "app-datetime-wrapper",
  templateUrl: "./datetime-wrapper.component.html",
  styleUrls: ["./datetime-wrapper.component.scss"]
})
export class DatetimeWrapperComponent implements AfterContentInit, OnDestroy {
  @ContentChild(FormControlName) control: FormControlName;
  value: any;
  private sub: Subscription;

  constructor() {}

  ngAfterContentInit() {
    this.sub = this.control.valueChanges.subscribe(value => {
      this.value = value;
    });
  }

  onClear() {
    this.control.control.patchValue(null);
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }
}
