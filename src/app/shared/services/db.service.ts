import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Platform } from "@ionic/angular";
import { Storage } from "@ionic/storage";
import { ReplaySubject } from "rxjs";
import { map, switchMap, take, tap } from "rxjs/operators";
import initSqlJs from "sql.js";
import { SqlJs } from "sql.js/module";

@Injectable()
export class DbService {
  private db: SqlJs.Database;
  private isReady = new ReplaySubject(1);
  private SQL: SqlJs.SqlJsStatic;
  private _startDb$ = new ReplaySubject(1);

  constructor(
    private platform: Platform,
    private http: HttpClient,
    private storage: Storage
  ) {
    this.platform.ready().then(async () => {
      this.createDb().then(() => {
        this.isReady.next();
        this._startDb$.next();
      });
    });
  }

  get startDb$() {
    return this._startDb$.asObservable();
  }

  async createDb(): Promise<void> {
    // initialize sql.js and get db data from storage
    const [SQL, dbData] = await Promise.all([
      initSqlJs(),
      this.storage.get("db")
    ]);
    this.SQL = SQL;
    if (dbData) {
      this.db = new SQL.Database(dbData);
    } else {
      this.db = new SQL.Database();
      await this.seedDatabase();
    }
  }

  async seedDatabase() {
    const sql = await this.http
      .get("assets/seed.sql", { responseType: "text" })
      .toPromise();

    this.db.run(sql);
    this.save();
  }

  insertRow(tableName: string, data: Record<string, any>) {
    return this.isReady.pipe(
      take(1),
      map(() => {
        data = {
          id: null,
          ...data
        };
        const formattedData = Object.values(data);
        const columns = Object.keys(data).join(",");
        const params = new Array(formattedData.length).fill("?").join(",");
        this.db.run(
          `INSERT INTO ${tableName} (${columns}) VALUES (${params})`,
          formattedData
        );
        const stmt = this.db.prepare("SELECT last_insert_rowid() as id");
        stmt.step();
        const result = stmt.getAsObject();
        stmt.free();
        this.save();
        return result.id as number;
      })
    );
  }

  getRowById(tableName: string, id: number) {
    return this.isReady.pipe(
      take(1),
      map(() => {
        const stmt = this.db.prepare(
          `SELECT * FROM ${tableName} WHERE id = ?`,
          [id]
        );
        stmt.step(); // Execute the statement
        const result = stmt.getAsObject();
        stmt.free();
        return result.id ? result : null;
      })
    );
  }

  getRows(tableName: string) {
    return this.isReady.pipe(
      take(1),
      map(() => {
        const rows: any[] = [];
        const stmt = this.db.prepare(`SELECT * FROM ${tableName}`);
        while (stmt.step()) {
          rows.push(stmt.getAsObject());
        }
        stmt.free();
        return rows;
      })
    );
  }

  updateRowById(tableName: string, data: Record<string, any>, id: number) {
    const params = Object.keys(data).map(key => `${key} = ?`);

    return this.isReady.pipe(
      take(1),
      map(() => {
        this.db.run(
          `UPDATE ${tableName} SET ${params.join(",")} WHERE id = ?`,
          [...Object.values(data), id]
        );
        this.save();
      })
    );
  }

  deleteRowById(tableName: string, id: number) {
    return this.isReady.pipe(
      take(1),
      map(() => {
        this.db.run(`DELETE FROM ${tableName} WHERE id = ?`, [id]);
        this.save();
      })
    );
  }

  save() {
    const data = this.db.export();
    this.storage.set("db", data);
  }

  getRowsBySql(sql: string, params: any[] = []) {
    return this.isReady.pipe(
      take(1),
      map(() => {
        const rows: any[] = [];
        const stmt = this.db.prepare(sql, params);
        while (stmt.step()) {
          rows.push(stmt.getAsObject());
        }
        stmt.free();
        return rows;
      })
    );
  }

  getRowBySql(sql: string, params: any[] = []) {
    return this.isReady.pipe(
      take(1),
      map(() => {
        const stmt = this.db.prepare(sql, params);
        stmt.step();
        const result = stmt.getAsObject();
        stmt.free();
        return result;
      })
    );
  }

  export() {
    return this.isReady.pipe(
      take(1),
      map(() => this.db.export())
    );
  }

  import(dbData) {
    return this.isReady.pipe(
      take(1),
      switchMap(() => {
        const parseData = JSON.parse("[" + dbData + "]");
        this.db = new this.SQL.Database(parseData);
        this._startDb$.next();
        return this.storage.set("db", parseData);
      })
    );
  }
}
