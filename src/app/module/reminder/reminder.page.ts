import { Component, OnInit } from "@angular/core";
import { PickerController } from "@ionic/angular";
import { take } from "rxjs/operators";
import { Reminder } from "./reminder.model";
import { ReminderService } from "./reminder.service";

@Component({
  selector: "app-reminder",
  templateUrl: "./reminder.page.html",
  styleUrls: ["./reminder.page.scss"]
})
export class ReminderPage implements OnInit {
  reminder: Reminder;

  constructor(
    private reminderService: ReminderService,
    private pickerCtrl: PickerController
  ) {}

  ngOnInit() {
    this.reminderService.reminder.pipe(take(1)).subscribe(reminder => {
      this.reminder = reminder;
    });
  }

  onToggleReminder() {
    this.reminderService
      .updateReminder({ show: this.reminder.show })
      .subscribe();
  }

  async onOpenDayPicker() {
    const pickerEl = await this.pickerCtrl.create({
      columns: [
        {
          name: "days",
          options: new Array(30).fill(0).map((_, i) => ({
            text: (i + 1).toString(),
            value: i + 1
          }))
        }
      ],
      buttons: [
        {
          text: "Cancel",
          role: "cancel"
        },
        {
          text: "Confirm",
          handler: data => {
            this.reminder.daysBefore = data.days.value;
            this.reminderService
              .updateReminder({ daysBefore: data.days.value })
              .subscribe();
          }
        }
      ]
    });

    pickerEl.columns[0].selectedIndex = this.reminder.daysBefore - 1;
    await pickerEl.present();
  }

  onTimeChange() {
    this.reminderService
      .updateReminder({ time: this.reminder.time })
      .subscribe();
  }
}
