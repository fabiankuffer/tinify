//tables stores all the login-attempts for all accounts
class loginattemptRepo {
    constructor(dao) {
      this.dao = dao;
    }
    
    //creates table if not exists
    createTable() {
      const sql = `
      CREATE TABLE IF NOT EXISTS loginattempt (
        user_id INTEGER NOT NULL,
        timestamp INTEGER NOT NULL,
        PRIMARY KEY ( user_id, timestamp),
        FOREIGN KEY(user_id) REFERENCES Users(id)
        )`;
      return this.dao.run(sql);
    }

    //creates an login-attempt
    create(user_id, timestamp) {
        return this.dao.run(
          `INSERT INTO loginattempt (user_id, timestamp)
            VALUES (?, ?)`,
          [user_id, timestamp]);
    }

    //delete all login-attempts for the specific user
    delete(user_id, timestamp) {
        return this.dao.run(
          `DELETE FROM loginattempt WHERE user_id = ? AND timestamp= ?`,
          [user_id, timestamp]
        );
    }

    //delete all login-attempts older than a specific timestamp from a specific user
    deleteOlderThan(user_id, timestamp) {
        return this.dao.run(
          `DELETE FROM loginattempt WHERE user_id = ? AND timestamp < ?`,
          [user_id, timestamp]
        );
    }

    //get count of login-attempts newer than a specific timestamp from a specific user
    getCountYoungerThan(id, timestamp) {
        return this.dao.get(
         `SELECT COUNT(*) AS count FROM loginattempt WHERE user_id = ? AND timestamp > ?`,
         [id, timestamp]);
    }
}
  
module.exports = loginattemptRepo;