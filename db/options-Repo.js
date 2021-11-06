//stores the suggestion option of a specific user
class optionsRepo {
    constructor(dao) {
      this.dao = dao;
    }
  
    //creates the necessary table if not exists
    createTable() {
      //suggestion:0 => random song
      //suggestion:1 => recommended song
      const sql = `
      CREATE TABLE IF NOT EXISTS options (
        user_id INTEGER NOT NULL PRIMARY KEY,
        suggestions INTEGER NOT NULL,
        FOREIGN KEY(user_id) REFERENCES Users(id)
        )`;
      return this.dao.run(sql);
    }

    //creates an entry
    create(user_id, suggestions) {
        return this.dao.run(
          `INSERT INTO options (user_id, suggestions)
            VALUES (?, ?)`,
          [user_id, suggestions]);
    }

    //updates an entry
    update(user_id, suggestions) {
        return this.dao.run(
          `UPDATE options
          SET suggestions = ?
          WHERE user_id = ?`,
          [suggestions, user_id]
        );
    }

    //deletes the entry of a user
    delete(user_id) {
        return this.dao.run(
          `DELETE FROM options WHERE user_id = ?`,
          [user_id]
        );
    }

    //get the useroptions for the specific user
    getByUser(user) {
        return this.dao.get(
          `SELECT * FROM options WHERE user_id = ?`,
          [user]);
    }

    
}
  
module.exports = optionsRepo;