import { Component, OnInit } from "@angular/core";
import { Plugins } from "@capacitor/core";
import {
  LoadingController,
  NavController,
  ToastController
} from "@ionic/angular";
import { BackupService } from "./backup.service";
import { ToastOptions } from "@ionic/core";

@Component({
  selector: "app-backup",
  templateUrl: "./backup.page.html",
  styleUrls: ["./backup.page.scss"]
})
export class BackupPage implements OnInit {
  email: string;

  constructor(
    private backupService: BackupService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private navCtrl: NavController
  ) {}

  ngOnInit() {
    Plugins.Storage.get({ key: "userData" }).then(data => {
      const userData = data.value && JSON.parse(data.value);
      this.email = userData?.email;
    });
  }

  onSignOut() {
    this.loadingCtrl
      .create({
        message: "Signing Out..."
      })
      .then(loadingEl => {
        loadingEl.present();
        this.backupService.googleSignOut().then(() => {
          Plugins.Storage.remove({ key: "userData" }).then(() => {
            loadingEl.dismiss();
            this.navCtrl.navigateBack("/backup/signin", { replaceUrl: true });
          });
        });
      });
  }

  export() {
    this.loadingCtrl
      .create({
        message: "Backing data up to your drive..."
      })
      .then(loadingEl => {
        loadingEl.present();
        this.backupService.export().subscribe(
          () => {
            loadingEl.dismiss();
            this.showAlert({
              message: "Your data has been backed up."
            });
          },
          errRes => {
            loadingEl.dismiss();
            if (errRes.message === "unauthorized") {
              this.unauthorize();
            } else {
              this.showAlert({
                message: "Failed to back up. Please try again.",
                color: "danger"
              });
            }
          }
        );
      });
  }

  async showAlert(options: ToastOptions) {
    const toastEl = await this.toastCtrl.create({
      duration: 5000,
      ...options
    });
    toastEl.present();
  }

  private unauthorize() {
    this.showAlert({
      message: "Your session is expired. Please login again."
    });
    Plugins.Storage.remove({ key: "userData" }).then(() => {
      this.navCtrl.navigateBack("/backup/signin", { replaceUrl: true });
    });
  }

  import() {
    this.loadingCtrl
      .create({
        message: "Restoring your data..."
      })
      .then(loadingEl => {
        loadingEl.present();
        this.backupService
          .import()
          .then(() => {
            loadingEl.dismiss();
            this.showAlert({
              message: "Your data has been restored."
            });
          })
          .catch((err: Error) => {
            loadingEl.dismiss();
            if (err.message === "unauthorized") {
              this.unauthorize();
            } else {
              let message = "Unknown error occured. Please try again.";
              if (err.message === "file_not_found") {
                message = "Your backup file is missing.";
              }
              this.showAlert({
                message,
                color: "danger"
              });
            }
          });
      });
  }
}
