export class SqlitePorterMock {
  importSqlToDb(db: any, sql: string): Promise<any> {
    return new Promise((resolve) => {
      const data = db.export();
      const buffer = Buffer.from([data]);
      console.log(buffer);
      resolve(123);
    })
  }
}