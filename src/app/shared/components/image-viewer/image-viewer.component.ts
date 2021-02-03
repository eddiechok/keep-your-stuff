import { Component, Input, OnInit } from "@angular/core";
import { Capacitor } from "@capacitor/core";
import { PhotoViewer } from "@ionic-native/photo-viewer/ngx";

@Component({
  selector: "app-image-viewer",
  templateUrl: "./image-viewer.component.html",
  styleUrls: ["./image-viewer.component.scss"]
})
export class ImageViewerComponent implements OnInit {
  @Input() imagePath = "";

  constructor(private photoViewer: PhotoViewer) {}

  ngOnInit() {}

  onClick() {
    console.log("CONSOLE LOG !!!!! !!! !!!!!! !!!!");
    if (Capacitor.isNative) {
      console.log("Photo Viewer: " + JSON.stringify(this.photoViewer));
      this.photoViewer.show(this.imagePath, "");
    }
  }
}
