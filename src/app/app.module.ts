import { AdMob } from "@admob-plus/ionic/ngx";
import { HttpClient, HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { RouteReuseStrategy } from "@angular/router";
import { GooglePlus } from "@ionic-native/google-plus/ngx";
import { PhotoViewer } from "@ionic-native/photo-viewer/ngx";
import { SplashScreen } from "@ionic-native/splash-screen/ngx";
import { SQLitePorter } from "@ionic-native/sqlite-porter/ngx";
import { SQLite } from "@ionic-native/sqlite/ngx";
import { StatusBar } from "@ionic-native/status-bar/ngx";
import {
  ActionSheetController,
  AlertController,
  IonicModule,
  IonicRouteStrategy,
  Platform
} from "@ionic/angular";
import { IonicStorageModule, Storage } from "@ionic/storage";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { CustomActionSheetController } from "./shared/controllers/custom-action-sheet.controller";
import { CustomAlertController } from "./shared/controllers/custom-alert.controller";
import { DbService } from "./shared/services/db.service";
import { MobileDbService } from "./shared/services/mobile-db.service";

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot({
      rippleEffect: false,
      mode: "ios",
      backButtonIcon: "arrow-back",
      backButtonText: ""
    }),
    AppRoutingModule,
    HttpClientModule,
    IonicStorageModule.forRoot()
  ],
  providers: [
    StatusBar,
    SplashScreen,
    PhotoViewer,
    SQLitePorter,
    SQLite,
    GooglePlus,
    AdMob,
    // {provide: SQLitePorter, deps: [Platform], useFactory: (platform: Platform) => platform.is("cordova") ? new SQLitePorter() : new SqlitePorterMock()},
    // {provide: SQLite, deps: [Platform], useFactory: (platform: Platform) => platform.is("cordova") ? new SQLite() : new SQLiteMock()},
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    {
      provide: DbService,
      deps: [Platform, HttpClient, Storage, SQLite, SQLitePorter],
      useFactory: (
        platform: Platform,
        http: HttpClient,
        storage: Storage,
        sqlite: SQLite,
        sqlitePorter: SQLitePorter
      ) => {
        if (platform.is("hybrid")) {
          return new MobileDbService(platform, http, sqlite, sqlitePorter);
        } else {
          return new DbService(platform, http, storage);
        }
      }
    },
    {
      provide: AlertController,
      useClass: CustomAlertController
    },
    {
      provide: ActionSheetController,
      useClass: CustomActionSheetController
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
