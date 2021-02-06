import { SQLiteDatabaseConfig } from '@ionic-native/sqlite';
import { SQLiteObject } from './sqlite-object';
import initSqlJs from 'sql.js';

export class SQLiteMock {
public create(config: SQLiteDatabaseConfig): Promise<SQLiteObject> {
  return new Promise((resolve)=>{
    initSqlJs().then((SQL) => {
      const db = new SQL.Database();
      resolve(new SQLiteObject(db));
      })
  });
}
} 