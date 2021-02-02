import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { Reminder } from "./reminder.model";
import { map, tap, take } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class ReminderService {
  private _reminder = new BehaviorSubject<Reminder>({
    show: true,
    daysBefore: 1,
    time: "2021-02-01T05:00:00.000Z"
  });
  constructor() {}

  get reminder() {
    return this._reminder.asObservable();
  }

  updateReminder(newReminder: Partial<Reminder>) {
    return this._reminder.pipe(
      take(1),
      tap(reminder => {
        const updatedReminder = {
          ...reminder,
          ...newReminder
        };
        this._reminder.next(updatedReminder);
      })
    );
  }
}
