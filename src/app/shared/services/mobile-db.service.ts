import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { SQLite, SQLiteObject } from "@ionic-native/sqlite";
import { SQLitePorter } from "@ionic-native/sqlite-porter/ngx";
import { Platform } from "@ionic/angular";
import { ReplaySubject } from "rxjs";
import { switchMap, take } from "rxjs/operators";

@Injectable()
export class MobileDbService {
  private db: SQLiteObject;
  private isReady = new ReplaySubject();

  constructor(
    private platform: Platform,
    private http: HttpClient,
    private sqlite: SQLite,
    private sqlitePorter: SQLitePorter
  ) {
    this.platform.ready().then(async () => {
      this.createDb().then(() => {
        this.isReady.next();
      });
    });
  }

  async createDb(): Promise<void> {
    // initialize sql.js and get db data from storage
    const db = await this.sqlite.create({
      name: "keep-your-stuff.db",
      location: "default"
    });

    this.db = db;
    await this.seedDatabase();
  }

  async seedDatabase() {
    const sql = await this.http
      .get("assets/seed.sql", { responseType: "text" })
      .toPromise();
    await this.sqlitePorter.importSqlToDb(this.db, sql);
  }

  insertRow(tableName: string, data: Record<string, any>) {
    return this.isReady.pipe(
      take(1),
      switchMap(() => {
        data = {
          id: null,
          ...data
        };
        const formattedData = Object.values(data);
        const columns = Object.keys(data).join(",");
        const params = new Array(formattedData.length).fill("?").join(",");
        return this.db
          .executeSql(
            `INSERT INTO ${tableName} (${columns}) VALUES (${params})`,
            formattedData
          )
          .then(data => {
            return data.insertId;
          });
      })
    );
  }

  getRowById(tableName: string, id: number) {
    return this.isReady.pipe(
      take(1),
      switchMap(() => {
        return this.db
          .executeSql(`SELECT * FROM ${tableName} WHERE id = ?`, [id])
          .then(data => {
            if (data.rows.length > 0) {
              return data.rows.item(0);
            }
            return null;
          });
      })
    );
  }

  getRows(tableName: string) {
    return this.isReady.pipe(
      take(1),
      switchMap(() => {
        return this.db
          .executeSql(`SELECT * FROM ${tableName}`, [])
          .then(data => {
            const rows = [];
            for (let i = 0; i < data.rows.length; i++) {
              rows.push(data.rows.item(i));
            }
            return rows;
          });
      })
    );
  }

  updateRowById(tableName: string, data: Record<string, any>, id: number) {
    const params = Object.keys(data).map(key => `${key} = ?`);

    return this.isReady.pipe(
      take(1),
      switchMap(() => {
        return this.db.executeSql(
          `UPDATE ${tableName} SET ${params.join(",")} WHERE id = ?`,
          [...Object.values(data), id]
        );
      })
    );
  }

  deleteRowById(tableName: string, id: number) {
    return this.isReady.pipe(
      take(1),
      switchMap(() => {
        return this.db.executeSql(`DELETE FROM ${tableName} WHERE id = ?`, [
          id
        ]);
      })
    );
  }

  save() {
    // const data = this.db.export();
    // this.storage.set("db", data);
  }

  getRowsBySql(sql: string, params: any[] = []) {
    return this.isReady.pipe(
      take(1),
      switchMap(() => {
        return this.db.executeSql(sql, params).then(data => {
          const rows = [];
          for (let i = 0; i < data.rows.length; i++) {
            rows.push(data.rows.item(i));
          }
          return rows;
        });
      })
    );
  }

  getRowBySql(sql: string, params: any[] = []) {
    return this.isReady.pipe(
      take(1),
      switchMap(() => {
        return this.db.executeSql(sql, params).then(data => {
          return data.rows.item(0);
        });
      })
    );
  }
}
