import { SQLiteObject } from "@ionic-native/sqlite/ngx";

export class ExtendedSqliteObject extends SQLiteObject {
  constructor(objectInstance: any, private storage: Storage) {
    super(objectInstance);
  }
  
  export() {
    console.error('exported from native');
  }
}