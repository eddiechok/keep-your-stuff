import { Component, Input, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ModalController, ToastController } from "@ionic/angular";
import { take } from "rxjs/operators";
import { LocationService } from "../location.service";

@Component({
  selector: "app-add-location-modal",
  templateUrl: "./add-location-modal.component.html",
  styleUrls: ["./add-location-modal.component.scss"]
})
export class AddLocationModalComponent implements OnInit {
  @Input() id: number;
  form: FormGroup;
  isLoading = false;
  colors = [
    "primary",
    "secondary",
    "tertiary",
    "success",
    "warning",
    "danger",
    "medium",
    "dark"
  ];

  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder,
    private locationService: LocationService,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      name: [null, [Validators.required]],
      color: [null, [Validators.required]]
    });

    if (this.id) {
      this.isLoading = true;
      this.locationService
        .getLocation(this.id)
        .pipe(take(1))
        .subscribe(
          location => {
            this.form.setValue({
              name: location.name,
              color: location.color
            });
            this.isLoading = false;
          },
          (err: Error) => {
            if (err.message === "not_found") {
              this.toastCtrl
                .create({
                  message: "Error in finding location. Please try again.",
                  duration: 3000,
                  color: "danger"
                })
                .then(toastEl => {
                  toastEl.present();
                  this.modalCtrl.dismiss();
                });
            }
          }
        );
    }
  }

  onCancel() {
    this.modalCtrl.dismiss();
  }

  onSubmit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    if (this.id) {
      this.locationService
        .updateLocation(this.id, {
          ...this.form.value
        })
        .subscribe(() => {
          this.modalCtrl.dismiss();
        });
    } else {
      this.locationService
        .addLocation({
          ...this.form.value
        })
        .subscribe(() => {
          this.modalCtrl.dismiss();
        });
    }
  }

  onSelectColor(color: string) {
    this.form.patchValue({
      color
    });
  }
}
