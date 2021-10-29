class loginattemptRepo {
    constructor(dao) {
      this.dao = dao;
    }
  
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

    create(user_id, timestamp) {
        return this.dao.run(
          `INSERT INTO loginattempt (user_id, timestamp)
            VALUES (?, ?)`,
          [user_id, timestamp]);
    }

    delete(user_id, timestamp) {
        return this.dao.run(
          `DELETE FROM loginattempt WHERE user_id = ? AND timestamp= ?`,
          [user_id, timestamp]
        );
    }

    deleteOlderThan(user_id, timestamp) {
        return this.dao.run(
          `DELETE FROM loginattempt WHERE user_id = ? AND timestamp < ?`,
          [user_id, timestamp]
        );
    }

    getCountYoungerThan(id, timestamp) {
        return this.dao.get(
         `SELECT COUNT(*) AS count FROM loginattempt WHERE user_id = ? AND timestamp > ?`,
         [id, timestamp]);
    }
}
  
module.exports = loginattemptRepo;