import { Directive, OnInit, Self } from "@angular/core";
import { IonHeader } from "@ionic/angular";

@Directive({
  selector: "[appMode]"
})
export class ModeDirective implements OnInit {
  constructor(@Self() private ionHeader: IonHeader) {}

  ngOnInit() {
    this.ionHeader.mode = "md";
  }
}
