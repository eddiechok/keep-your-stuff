import { Component, OnInit, Input } from "@angular/core";
import { FullScreenImage } from "@ionic-native/full-screen-image/ngx";
import { Capacitor } from "@capacitor/core";

@Component({
  selector: "app-image-viewer",
  templateUrl: "./image-viewer.component.html",
  styleUrls: ["./image-viewer.component.scss"]
})
export class ImageViewerComponent implements OnInit {
  @Input() imagePath = "";

  constructor(private fullScreenImage: FullScreenImage) {}

  ngOnInit() {}

  onClick() {
    if (Capacitor.isNative) {
      this.fullScreenImage.showImageURL(this.imagePath).then(a => {
        console.log(a);
      });
    }
  }
}
