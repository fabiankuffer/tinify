const sqlite3 = require('sqlite3');
const Promise = require('bluebird');

//main data access object class
class AppDAO {
    //contructor to connect to db
    constructor(dbFilePath) {
      this.db = new sqlite3.Database(dbFilePath, (err) => {
        if (err) {
          console.log('Could not connect to database', err);
        } else {
          console.log('Connected to database');
        }
      })
    }

    //used for create, alter, delete, update instructions
    run(sql, params = []) {
        return new Promise((resolve, reject) => {
          this.db.run(sql, params, function (err) {
            if (err) {
              console.log('Error running sql ' + sql);
              console.log(err);
              reject(err);
            } else {
              resolve({ id: this.lastID });
            }
          })
        })
    }

    //used to get one result back from select
    get(sql, params = []) {
        return new Promise((resolve, reject) => {
          this.db.get(sql, params, (err, result) => {
            if (err) {
              console.log('Error running sql: ' + sql);
              console.log(err);
              reject(err);
            } else {
              resolve(result);
            }
          })
        });
    }
    
    //used to get multiple entrieb back from select
    all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
            if (err) {
                console.log('Error running sql: ' + sql);
                console.log(err);
                reject(err);
            } else {
                resolve(rows);
            }
            })
        });
    }
};
  
module.exports = AppDAO;