import { Injectable, NgZone } from "@angular/core";
import {
  LocalNotification,
  Plugins,
  Capacitor,
  LocalNotificationPendingList
} from "@capacitor/core";
import { subDays } from "date-fns";
import { map, switchMap, take } from "rxjs/operators";
import { Reminder } from "src/app/module/reminder/reminder.model";
import { ReminderService } from "src/app/module/reminder/reminder.service";
import { StuffService } from "src/app/module/stuff/stuff.service";
import { Router } from "@angular/router";
import { Stuff } from "src/app/module/stuff/stuff.model";
import { of } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class NotificationService {
  constructor(
    private stuffService: StuffService,
    private reminderService: ReminderService,
    private router: Router,
    private ngZone: NgZone
  ) {}

  /**
   * Add listener for clicked notifications
   * Subscribe to reminder (If got any changes, reschedule notifications)
   */
  initialize() {
    if (Capacitor.isPluginAvailable("LocalNotifications")) {
      // Listen for local notifications
      Plugins.LocalNotifications.addListener(
        "localNotificationActionPerformed",
        notificationActionPerformed => {
          console.log(
            "notificationActionPerformed !!!!!!!!!!!!!!!!: " +
              JSON.stringify(notificationActionPerformed)
          );
          if (
            notificationActionPerformed.notification.actionTypeId ===
            "expiration_reminder"
          ) {
            const stuffId = notificationActionPerformed.notification.id;
            if (stuffId) {
              this.ngZone.run(() => {
                this.router.navigateByUrl("/stuff/" + stuffId);
              });
            }
          }
        }
      );

      // Subscribe to reminder
      let _reminder: Reminder;
      this.reminderService.reminder
        .pipe(
          switchMap(reminder => {
            console.warn(
              "notification service initialize(): subscribe to reminder"
            );
            _reminder = reminder;

            // if reminder is turn off, return empty stuffs
            if (!reminder.show) {
              return of([] as Stuff[]);
            }
            console.warn(
              "notification service initialize(): subscribe to get stuffs"
            );
            return this.stuffService.stuffs.pipe(take(1));
          }),
          map(stuffs => {
            return stuffs.filter(
              stuff =>
                !!stuff.expiryDate && // filter no expiry date
                new Date(stuff.expiryDate) > new Date() // filter ady expired
            );
          })
        )
        .subscribe(async unexpiredStuffs => {
          const scheduledNotifs: LocalNotification[] = [];
          unexpiredStuffs.forEach(stuff => {
            const hours = new Date(_reminder.time).getHours();
            const minutes = new Date(_reminder.time).getMinutes();
            const reminderDate = subDays(
              new Date(stuff.expiryDate),
              _reminder.daysBefore
            );
            reminderDate.setHours(hours, minutes, 0, 0);

            // if reminder date greater than today
            if (reminderDate >= new Date()) {
              scheduledNotifs.push({
                title: "Expiration Reminder",
                body: `Hey! ${stuff.name} is going to expire soon! Hurry up and check it out!`,
                id: stuff.id,
                schedule: { at: reminderDate },
                actionTypeId: "expiration_reminder"
              });
            }
          });

          if (scheduledNotifs.length > 0) {
            // cancel all pending notifications
            const pendingList = await Plugins.LocalNotifications.getPending();
            if (pendingList.notifications.length > 0) {
              await Plugins.LocalNotifications.cancel(pendingList);
            }

            // schedule new notifications
            await Plugins.LocalNotifications.schedule({
              notifications: scheduledNotifs
            });
            console.log(
              "Pending List!!!!!!!!!!!!!!!!!: " +
                JSON.stringify(await Plugins.LocalNotifications.getPending())
            );
          }
        });
    }
  }

  /**
   * Reschedule notification when the stuff's expiry date is updated
   * @param stuff
   */
  async rescheduleNotification(stuff: {
    id: number;
    name: string;
    expiryDate: string;
  }) {
    // schedule new notification
    this.reminderService.reminder.pipe(take(1)).subscribe(async reminder => {
      console.warn(
        "notification service rescheduleNotification(): subscribe to reminder"
      );
      // don't do anything if reminder is off
      if (!reminder.show) {
        return;
      }

      // cancel selected stuff in pending notifications
      const pendingList = await Plugins.LocalNotifications.getPending();
      const selectedNotification = pendingList.notifications.find(
        notif => notif.id === stuff.id.toString()
      );

      if (selectedNotification) {
        const newPendingList: LocalNotificationPendingList = {
          notifications: [selectedNotification]
        };
        await Plugins.LocalNotifications.cancel(newPendingList);
      }

      // get reminder date
      const hours = new Date(reminder.time).getHours();
      const minutes = new Date(reminder.time).getMinutes();
      const reminderDate = subDays(
        new Date(stuff.expiryDate),
        reminder.daysBefore
      );
      reminderDate.setHours(hours, minutes, 0, 0);

      // if reminder date greater than today
      if (reminderDate >= new Date()) {
        await Plugins.LocalNotifications.schedule({
          notifications: [
            {
              title: "Expiration Reminder",
              body: `Hey! ${stuff.name} is going to expire soon! Hurry up and check it out!`,
              id: stuff.id,
              schedule: { at: reminderDate },
              actionTypeId: "expiration_reminder"
            }
          ]
        });
      }

      console.log(
        "Pending List!!!!!!!!!!!!!!!!!: " +
          JSON.stringify(await Plugins.LocalNotifications.getPending())
      );
    });
  }
}
