import { Component, Input, OnInit } from "@angular/core";
import { Capacitor } from "@capacitor/core";
import { PhotoViewer } from "@ionic-native/photo-viewer/ngx";

@Component({
  selector: "app-image-viewer",
  templateUrl: "./image-viewer.component.html",
  styleUrls: ["./image-viewer.component.scss"]
})
export class ImageViewerComponent implements OnInit {
  @Input() imageUrl = "";
  @Input() filepath = "";

  constructor(private photoViewer: PhotoViewer) {}

  ngOnInit() {}

  onClick() {
    console.log("CONSOLE LOG !!!!! !!! !!!!!! !!!!");
    if (Capacitor.isNative && this.filepath) {
      console.log("Photo Viewer: ");
      console.log(this.photoViewer, this.filepath);
      this.photoViewer.show(this.filepath, "");
    }
  }
}
