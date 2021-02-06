import { Storage } from "@ionic/storage";

export class SQLiteObject {
  _objectInstance: any;

  constructor(_objectInstance: any){
      this._objectInstance = _objectInstance;
  };

  executeSql(statement: string, params: any[]): Promise<any>{

      return new Promise((resolve,reject)=>{
          try {
              var st = this._objectInstance.prepare(statement,params);
              var rows :Array<any> = [] ;
              while(st.step()) { 
                  var row = st.getAsObject();
                  rows.push(row)
              }
              var payload = {
                  rows: {
                  item: function(i) {
                      return rows[i];
                  },
                  length: rows.length
                  },
                  rowsAffected: this._objectInstance.getRowsModified() || 0,
                  insertId: this._objectInstance.insertId || void 0
              };  
              resolve(payload);
          } catch(e){
              reject(e);
          }
      });
  };

  export() {}
}