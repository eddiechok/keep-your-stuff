import { Injectable } from "@angular/core";
import { Plugins } from "@capacitor/core";
import { GooglePlus } from "@ionic-native/google-plus/ngx";
import { Platform } from "@ionic/angular";
import { combineLatest } from "rxjs";
import { switchMap } from "rxjs/operators";
import { DbService } from "src/app/shared/services/db.service";
import { GoogleUserData } from "./backup.model";

@Injectable({
  providedIn: "root"
})
export class BackupService {
  constructor(
    private db: DbService,
    private platform: Platform,
    private googlePlus: GooglePlus
  ) {
    gapi.load("client", this.initClient.bind(this));
  }

  get fileName() {
    if (this.platform.is("hybrid")) {
      return "keep-your-stuff.sql";
    } else {
      return "keep-your-stuff.bin";
    }
  }

  googleSignIn() {
    return this.googlePlus.login({}).then((userData: GoogleUserData) => {
      gapi.client.setToken({
        access_token: userData.accessToken
      });
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

  async initClient() {
    const [userData]: [GoogleUserData, any] = await Promise.all([
      this.googlePlus.trySilentLogin({}),
      gapi.client.init({
        apiKey: "AIzaSyD4Y1svAZMQD5B2DDpXPdjsXGHAc9qA_MA",
        clientId:
          "500356655488-aumpajve7a9k0iqs5iai290hs0l4jn4n.apps.googleusercontent.com",
        discoveryDocs: [
          "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"
        ]
      })
    ]);

    gapi.client.setToken({
      access_token: userData.accessToken
    });
    Plugins.Storage.set({
      key: "userData",
      value: JSON.stringify(userData)
    });
  }

  // private setAccessToken(data: string) {
  //   const userData = JSON.parse(data) as GoogleUserData;
  //   gapi.client.setToken({
  //     access_token: userData.accessToken
  //   });
  // }

  export() {
    return combineLatest([
      this.db.export(),
      Plugins.Storage.get({ key: "backupFileId" })
    ]).pipe(
      switchMap(async ([dbData, backupFileId]) => {
        const fileId = backupFileId?.value;

        if (fileId) {
          return this.updateFile(dbData, fileId);
        } else {
          return this.addFile(dbData);
        }
      })
    );
  }

  private async addFile(dbData: any) {
    const boundary = "xyz";
    const multipartBody = this.getMultipartBody(
      dbData,
      {
        name: this.fileName
      },
      boundary
    );
    try {
      const response = await gapi.client.request({
        path: `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart`,
        method: "POST",
        headers: {
          "Content-Type": `multipart/related; boundary=${boundary}`
        },
        body: multipartBody
      });

      // add fileId to Storage
      Plugins.Storage.set({
        key: "backupFileId",
        value: response.result.id
      });

      return response;
    } catch (errRes) {
      if (errRes.result.error.code === 401) {
        throw new Error("unauthorized");
      } else {
        throw new Error("unknown_error");
      }
    }
  }

  private async updateFile(dbData: any, fileId: string) {
    const boundary = "xyz";
    const multipartBody = this.getMultipartBody(
      dbData,
      {
        name: this.fileName,
        trashed: false
      },
      boundary
    );
    try {
      const response = await gapi.client.request({
        path: `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`,
        method: "PATCH",
        headers: {
          "Content-Type": `multipart/related; boundary=${boundary}`
        },
        body: multipartBody
      });

      if (!fileId) {
        Plugins.Storage.set({
          key: "backupFileId",
          value: response.result.id
        });
      }
      return response;
    } catch (errRes) {
      if (errRes.result.error.code === 401) {
        throw new Error("unauthorized");
      } else if (
        errRes.result.error.errors &&
        errRes.result.error.errors.length > 0 &&
        errRes.result.error.errors[0].reason === "notFound"
      ) {
        const response = await this.addFile(dbData);
        return response;
      } else {
        throw new Error("unknown_error");
      }
    }
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
    return gapi.client
      .request({
        path: "https://www.googleapis.com/drive/v3/files",
        params: {
          q: `name = '${this.fileName}' and trashed = false`
        }
      })
      .then(res => {
        if (res.result.files.length > 0) {
          const fileId = res.result.files[0].id;
          Plugins.Storage.set({ key: "backupFileId", value: fileId });
          return this.downloadFile(fileId);
        } else {
          throw new Error("file_not_found");
        }
      })
      .catch(errRes => {
        if (errRes.result.error.code === 401) {
          throw new Error("unauthorized");
        } else {
          throw new Error("unknown_error");
        }
      });
  }

  private downloadFile(fileId: string) {
    return gapi.client
      .request({
        path: `https://www.googleapis.com/drive/v3/files/${fileId}`,
        params: {
          alt: "media"
        }
      })
      .then(res => {
        this.db.import(res.body).subscribe();
      });
  }
}
