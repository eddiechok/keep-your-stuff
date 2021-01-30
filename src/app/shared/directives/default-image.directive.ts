import {
  Directive,
  HostBinding,
  Input,
  OnInit,
  HostListener
} from "@angular/core";

@Directive({
  selector: "[appDefaultImage]"
})
export class DefaultImageDirective implements OnInit {
  @HostBinding("src")
  @Input()
  src: string;

  _defaultImg: string;
  @Input()
  private set appDefaultImage(value: string) {
    this._defaultImg = value || "../../../assets/images/general/no-image.png";
  }

  originalSrc: string;
  isOriginalImgLoaded = false;

  constructor() {}

  /**
   * @description it loads default image 1st and store original src to a variable
   */
  ngOnInit() {
    this.src = this.src || this._defaultImg;
  }

  /**
   * @desciption it is called when image is loading fails.
   */
  @HostListener("error")
  onError() {
    console.log("error");
    this.src = this._defaultImg;
  }
}
