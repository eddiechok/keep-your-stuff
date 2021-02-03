import {
  Component,
  OnInit,
  Input,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from "@angular/core";

@Component({
  selector: "app-control-error",
  templateUrl: "./control-error.component.html",
  styleUrls: ["./control-error.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush // wont detect changes whenever input is different
})
export class ControlErrorComponent implements OnInit {
  _text: string;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {}

  @Input() set text(value) {
    if (value !== this._text) {
      this._text = value;
      this.cdr.detectChanges(); // detect changes for DOM if value is different
    }
  }
}
