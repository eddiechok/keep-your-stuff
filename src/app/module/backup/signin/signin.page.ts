import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Plugins } from "@capacitor/core";
import { LoadingController } from "@ionic/angular";
import { BackupService } from "../backup.service";

@Component({
  selector: "app-signin",
  templateUrl: "./signin.page.html",
  styleUrls: ["./signin.page.scss"]
})
export class SigninPage implements OnInit {
  constructor(
    private backupService: BackupService,
    private loadingCtrl: LoadingController,
    private router: Router
  ) {}

  ngOnInit() {}

  onSignIn() {
    this.loadingCtrl
      .create({
        message: "Connecting To Google..."
      })
      .then(loadingEl => {
        loadingEl.present();
        this.backupService
          .googleSignIn()
          .then(() => {
            loadingEl.dismiss();
            this.router.navigateByUrl("/backup", { replaceUrl: true });
          })
          .catch(err => {
            console.log(err);
            loadingEl.dismiss();
          });
      });
  }
}
