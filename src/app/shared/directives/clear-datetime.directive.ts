import { Directive, HostBinding, Input, OnInit } from "@angular/core";
import { NgControl } from "@angular/forms";
import { DatetimeOptions } from "@ionic/core";
import * as DateTimeUtils from "@ionic/core/dist/collection/components/datetime/datetime-util.js";

@Directive({
  selector: "[appClearDatetime]"
})
export class ClearDatetimeDirective implements OnInit {
  @HostBinding("pickerOptions") pickerOptions: DatetimeOptions;

  // @HostBinding("formControlName")
  // @Input()
  formControlName: string = "expiryDate";

  constructor(private control: NgControl) {}

  ngOnInit() {
    this.pickerOptions = {
      buttons: [
        {
          text: "Clear",
          handler: () => {
            this.control.control.patchValue({
              [this.formControlName]: ""
            });
          }
        }
      ]
    };
  }
}
