import { Injectable } from "@angular/core";
import {
  CameraPhoto,
  Capacitor,
  FilesystemDirectory,
  Plugins
} from "@capacitor/core";
import { Platform } from "@ionic/angular";

const { Filesystem } = Plugins;

@Injectable({
  providedIn: "root"
})
export class PhotoService {
  constructor(private platform: Platform) {}

  async savePicture(cameraPhoto: CameraPhoto) {
    // Convert photo to base64 format, required by Filesystem API to save
    const base64Data = await this.readAsBase64(cameraPhoto);

    // Write the file to the data directory
    const fileName = new Date().getTime() + ".jpeg";
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: FilesystemDirectory.Data
    });

    if (this.platform.is("hybrid")) {
      console.log(savedFile.uri, Capacitor.convertFileSrc(savedFile.uri));
      return {
        filepath: savedFile.uri,
        webviewPath: Capacitor.convertFileSrc(savedFile.uri)
      };
    } else {
      // Use webPath to display the new image instead of base64 since it's
      // already loaded into memory
      return {
        filepath: fileName,
        webviewPath: cameraPhoto.webPath
      };
    }
  }

  async loadPicture(filepath: string) {
    if (!this.platform.is("hybrid")) {
      try {
        // Read each saved photo's data from the Filesystem
        const readFile = await Filesystem.readFile({
          path: filepath,
          directory: FilesystemDirectory.Data
        });

        // Web platform only: Load the photo as base64 data
        const dataUrl = `data:image/jpeg;base64,${readFile.data}`;
        const webviewPath = this.convertBase64ToBlobUrl(dataUrl);
        return webviewPath;
      } catch {
        return null;
      }
    } else {
      // if is mobile then convert the filepath to a webview path
      return filepath ? Capacitor.convertFileSrc(filepath) : null;
    }
  }

  async removePicture(filepath: string) {
    // await Filesystem.deleteFile({
    //   path: filepath,
    //   directory: FilesystemDirectory.Data
    // });
  }

  private async convertBase64ToBlobUrl(base64: string) {
    const response = await fetch(base64!);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    return blobUrl;
  }

  private async readAsBase64(cameraPhoto: CameraPhoto) {
    if (this.platform.is("hybrid")) {
      // Read the file into base64 format
      const file = await Filesystem.readFile({
        path: cameraPhoto.path
      });

      return file.data;
    } else {
      // Fetch the photo, read as a blob, then convert to base64 format
      const response = await fetch(cameraPhoto.webPath!);
      const blob = await response.blob();

      return (await this.convertBlobToBase64(blob)) as string;
    }
  }

  private convertBlobToBase64 = (blob: Blob) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.readAsDataURL(blob);
    });
}
