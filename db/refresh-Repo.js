class refreshRepo {
    constructor(dao) {
      this.dao = dao;
    }
  
    createTable() {
      const sql = `
      CREATE TABLE IF NOT EXISTS refresh (
        user_id INTEGER NOT NULL PRIMARY KEY,
        refresh_token TEXT NOT NULL,
        FOREIGN KEY(user_id) REFERENCES Users(id)
        )`;
      return this.dao.run(sql);
    }

    create(user_id, refresh_token) {
        return this.dao.run(
          `INSERT INTO refresh (user_id, refresh_token)
            VALUES (?, ?)`,
          [user_id, refresh_token]);
    }

    update(refresh) {
        const { user_id, refresh_token} = refresh
        return this.dao.run(
          `UPDATE refresh
          SET refresh_token = ?
          WHERE user_id = ?`,
          [refresh_token, user_id]
        );
    }

    delete(user_id) {
        return this.dao.run(
          `DELETE FROM refresh WHERE user_id = ?`,
          [user_id]
        );
    }

    getByUser(user) {
        return this.dao.get(
          `SELECT * FROM refresh WHERE user_id = ?`,
          [user]);
    }
}
  
module.exports = refreshRepo;