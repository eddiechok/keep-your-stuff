import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Plugins } from "@capacitor/core";
import { GooglePlus } from "@ionic-native/google-plus/ngx";
import { Platform } from "@ionic/angular";
import { combineLatest, ReplaySubject, throwError } from "rxjs";
import { catchError, switchMap, take, tap } from "rxjs/operators";
import { DbService } from "src/app/shared/services/db.service";
import { GoogleUserData } from "./backup.model";

@Injectable({
  providedIn: "root"
})
export class BackupService {
  private _accessToken$ = new ReplaySubject(1);
  private googleSignInOptions = {
    scopes:
      "https://www.googleapis.com/auth/drive.metadata https://www.googleapis.com/auth/drive.file"
  };

  constructor(
    private db: DbService,
    private platform: Platform,
    private googlePlus: GooglePlus,
    private http: HttpClient
  ) {
    this.init();
    // gapi.load("client", {
    //   callback: this.initClient.bind(this),
    //   onerror: function (a) {
    //     // Handle loading error.
    //     console.log("gapi.client loaded error!!!");
    //     console.log(JSON.stringify(a));
    //   },
    //   timeout: 5000, // 5 seconds.
    //   ontimeout: function () {
    //     // Handle timeout.
    //     alert("gapi.client could not load in a timely manner!");
    //   }
    // });
  }

  get accessToken$() {
    return this._accessToken$.pipe(take(1));
  }

  get fileName() {
    if (this.platform.is("hybrid")) {
      return "keep-your-stuff.sql";
    } else {
      return "keep-your-stuff.bin";
    }
  }

  googleSignIn() {
    return this.googlePlus
      .login({ ...this.googleSignInOptions })
      .then((userData: GoogleUserData) => {
        // gapi.client.setToken({
        //   access_token: userData.accessToken
        // });
        Plugins.Storage.set({
          key: "userData",
          value: JSON.stringify(userData)
        });
      });
    // return Plugins.GoogleAuth.signIn().then(userData => {
    //   console.log(userData.authentication.accessToken);
    //   gapi.client.setToken({
    //     access_token: userData.authentication.accessToken
    //   });
    //   Plugins.Storage.set({
    //     key: "userData",
    //     value: JSON.stringify(userData)
    //   });
    // });
  }

  googleSignOut() {
    return this.googlePlus.logout();
    // return Plugins.GoogleAuth.signOut();
  }

  init() {
    Promise.all([
      this.googlePlus.trySilentLogin({
        ...this.googleSignInOptions
      })
      // gapi.client.init({
      //   apiKey: "",
      //   clientId:
      //     "",
      //   discoveryDocs: [
      //     "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"
      //   ]
      // })
    ]).then(([userData]: [GoogleUserData, any]) => {
      // gapi.client.setToken({
      //   access_token: userData.accessToken
      // });
      Plugins.Storage.set({
        key: "userData",
        value: JSON.stringify(userData)
      });
      this._accessToken$.next(userData.accessToken);
    });
  }

  export() {
    return combineLatest([
      this.db.export(),
      Plugins.Storage.get({ key: "backupFileId" })
    ]).pipe(
      switchMap(([dbData, backupFileId]) => {
        const fileId = backupFileId?.value;
        if (fileId) {
          return this.updateFile(dbData, fileId);
        } else {
          return this.addFile(dbData);
        }
      })
    );
  }

  private addFile(dbData: any) {
    const boundary = "xyz";
    const multipartBody = this.getMultipartBody(
      dbData,
      {
        name: this.fileName
      },
      boundary
    );
    return this.accessToken$.pipe(
      switchMap(accessToken => {
        return this.http.post<any>(
          `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart`,
          multipartBody,
          {
            headers: {
              "Content-Type": `multipart/related; boundary=${boundary}`,
              Authorization: `Bearer ${accessToken}`
            }
          }
        );
      }),
      tap(response => {
        console.log("add file");
        console.log(response);
        // add fileId to Storage
        Plugins.Storage.set({
          key: "backupFileId",
          value: response.id
        });
      }),
      catchError(errRes => {
        console.log(errRes);
        if (errRes.status === 401) {
          throw new Error("unauthorized");
        } else {
          throw new Error("unknown_error");
        }
      })
    );
  }

  private updateFile(dbData: any, fileId: string) {
    const boundary = "xyz";
    const multipartBody = this.getMultipartBody(
      dbData,
      {
        name: this.fileName,
        trashed: false
      },
      boundary
    );
    return this.accessToken$.pipe(
      switchMap(accessToken => {
        return this.http.patch<any>(
          `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`,
          multipartBody,
          {
            headers: {
              "Content-Type": `multipart/related; boundary=${boundary}`,
              Authorization: `Bearer ${accessToken}`
            }
          }
        );
      }),
      tap(response => {
        if (!fileId) {
          Plugins.Storage.set({
            key: "backupFileId",
            value: response.id
          });
        }
      }),
      catchError(errRes => {
        console.log(errRes);
        if (errRes.status === 401) {
          throw new Error("unauthorized");
        } else if (
          errRes.error.error.errors &&
          errRes.error.error.errors.length > 0 &&
          errRes.error.error.errors[0].reason === "notFound"
        ) {
          return this.addFile(dbData);
        } else {
          throw new Error("unknown_error");
        }
      })
    );
  }

  private getMultipartBody(
    data,
    metadata: Record<string, any>,
    boundary: string
  ) {
    const delimiter = `\r\n--${boundary}\r\n`;
    const close_delim = `\r\n--${boundary}--`;
    const multipartBody =
      delimiter +
      "Content-Type: application/json; charset=UTF8\r\n\r\n" +
      JSON.stringify(metadata) +
      delimiter +
      "Content-Type: application/octet-stream\r\n\r\n" +
      data +
      close_delim;
    return multipartBody;
  }

  import() {
    return this.accessToken$.pipe(
      switchMap(accessToken => {
        return this.http.get<any>("https://www.googleapis.com/drive/v3/files", {
          params: {
            q: `name = '${this.fileName}' and trashed = false`
          },
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
      }),
      catchError(errRes => {
        if (errRes.status === 401) {
          throw new Error("unauthorized");
        } else {
          throw new Error("unknown_error");
        }
      }),
      switchMap(res => {
        if (res.files.length > 0) {
          const fileId = res.files[0].id;
          Plugins.Storage.set({ key: "backupFileId", value: fileId });
          return this.downloadFile(fileId);
        } else {
          throw new Error("file_not_found");
        }
      })
    );
  }

  private downloadFile(fileId: string) {
    return this.accessToken$.pipe(
      switchMap(accessToken => {
        return this.http.get(
          `https://www.googleapis.com/drive/v3/files/${fileId}`,
          {
            params: {
              alt: "media"
            },
            headers: {
              Authorization: `Bearer ${accessToken}`
            },
            responseType: "text"
          }
        );
      }),
      switchMap(res => {
        return this.db.import(res);
      })
    );
  }
}
