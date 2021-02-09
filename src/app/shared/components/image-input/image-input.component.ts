import { Component, OnInit, Output, EventEmitter, Input } from "@angular/core";
import {
  Plugins,
  CameraResultType,
  Capacitor,
  CameraOptions,
  CameraSource,
  CameraPhoto
} from "@capacitor/core";
import { ActionSheetController } from "@ionic/angular";
import { ActionSheetButton } from "@ionic/core";

@Component({
  selector: "app-image-input",
  templateUrl: "./image-input.component.html",
  styleUrls: ["./image-input.component.scss"]
})
export class ImageInputComponent implements OnInit {
  @Output() fileSelected = new EventEmitter<CameraPhoto>();
  @Input() selectedImage: string = "";

  constructor(private actionSheetCtrl: ActionSheetController) {}

  ngOnInit() {}

  onClick() {
    this.openActionSheet();
  }

  openActionSheet() {
    if (Capacitor.isPluginAvailable("Camera")) {
      const options: CameraOptions = {
        quality: 100,
        resultType: CameraResultType.Uri
      };
      const buttons: ActionSheetButton[] = [
        {
          text: "Take Photo",
          handler: async () => {
            const image = await Plugins.Camera.getPhoto({
              ...options,
              source: CameraSource.Camera
            });
            this.processImage(image);
          }
        },
        {
          text: "Choose Photo",
          handler: async () => {
            const image = await Plugins.Camera.getPhoto({
              ...options,
              source: CameraSource.Photos
            });
            this.processImage(image);
          }
        },
        { text: "Cancel", role: "cancel" }
      ];
      if (this.selectedImage) {
        buttons.push({
          text: "Remove Photo",
          handler: () => {
            this.processImage({ webPath: "", format: "" });
          }
        });
      }
      this.actionSheetCtrl
        .create({
          header: "Select Photo",
          buttons: buttons
        })
        .then(actionSheetEl => {
          actionSheetEl.present();
        });
    }
  }

  async processImage(image: CameraPhoto) {
    this.selectedImage = image.webPath;
    this.fileSelected.emit(image);
  }
}
