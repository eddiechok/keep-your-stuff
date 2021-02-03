import { Directive, ViewContainerRef } from "@angular/core";

@Directive({
  selector: "[appControlErrorContainer]"
})
export class ControlErrorContainerDirective {
  // create a ref for the view container
  constructor(public vcr: ViewContainerRef) {}
}
