import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Platform } from "@ionic/angular";
import { Storage } from "@ionic/storage";
import { ReplaySubject } from "rxjs";
import { map, take } from "rxjs/operators";
import initSqlJs from "sql.js";
import { SqlJs } from "sql.js/module";

@Injectable({
  providedIn: "root"
})
export class DbService {
  private db: SqlJs.Database;
  private isReady = new ReplaySubject();

  constructor(
    private platform: Platform,
    private http: HttpClient,
    private storage: Storage
  ) {
    this.platform.ready().then(async () => {
      this.createDb().then(() => {
        this.isReady.next();
      });
    });
  }

  async createDb(): Promise<void> {
    // initialize sql.js and get db data from storage
    const [SQL, dbData] = await Promise.all([
      initSqlJs(),
      this.storage.get("db")
    ]);

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
}
