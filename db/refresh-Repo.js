//stores the spotify refresh-token so that the user can log in from any device
class refreshRepo {
    constructor(dao) {
      this.dao = dao;
    }
  
    //creates the necessary table if not exists
    createTable() {
      const sql = `
      CREATE TABLE IF NOT EXISTS refresh (
        user_id INTEGER NOT NULL PRIMARY KEY,
        refresh_token TEXT NOT NULL,
        FOREIGN KEY(user_id) REFERENCES Users(id)
        )`;
      return this.dao.run(sql);
    }

    //creates an entry
    create(user_id, refresh_token) {
        return this.dao.run(
          `INSERT INTO refresh (user_id, refresh_token)
            VALUES (?, ?)`,
          [user_id, refresh_token]);
    }

    //updates an entry
    update(user_id, refresh_token) {
        return this.dao.run(
          `UPDATE refresh
          SET refresh_token = ?
          WHERE user_id = ?`,
          [refresh_token, user_id]
        );
    }

    //delete all entries of an user
    delete(user_id) {
        return this.dao.run(
          `DELETE FROM refresh WHERE user_id = ?`,
          [user_id]
        );
    }

    //get the refresh-token of an user
    getByUser(user) {
        return this.dao.get(
          `SELECT * FROM refresh WHERE user_id = ?`,
          [user]);
    }
}
  
module.exports = refreshRepo;