import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { RouteReuseStrategy } from "@angular/router";
import { PhotoViewer } from "@ionic-native/photo-viewer/ngx";
import { SplashScreen } from "@ionic-native/splash-screen/ngx";
import { SQLitePorter } from "@ionic-native/sqlite-porter/ngx";
import { SQLite } from '@ionic-native/sqlite/ngx';
import { StatusBar } from "@ionic-native/status-bar/ngx";
import { IonicModule, IonicRouteStrategy, Platform } from "@ionic/angular";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { SQLiteMock } from './db/sqlite-mock';
import { SqlitePorterMock } from "./db/sqlite-porter-mock";
import { IonicStorageModule } from '@ionic/storage';

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, HttpClientModule, IonicStorageModule.forRoot()],
  providers: [
    StatusBar,
    SplashScreen,
    PhotoViewer,
    SQLitePorter,
    SQLite,
    // {provide: SQLitePorter, deps: [Platform], useFactory: (platform: Platform) => platform.is("cordova") ? new SQLitePorter() : new SqlitePorterMock()},
    // {provide: SQLite, deps: [Platform], useFactory: (platform: Platform) => platform.is("cordova") ? new SQLite() : new SQLiteMock()},
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
