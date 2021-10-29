class optionsRepo {
    constructor(dao) {
      this.dao = dao;
    }
  
    createTable() {
      const sql = `
      CREATE TABLE IF NOT EXISTS options (
        user_id INTEGER NOT NULL PRIMARY KEY,
        autoplay INTEGER NOT NULL,
        suggestions INTEGER NOT NULL,
        FOREIGN KEY(user_id) REFERENCES Users(id)
        )`;
      return this.dao.run(sql);
    }

    create(user_id, autoplay, suggestions) {
        return this.dao.run(
          `INSERT INTO options (user_id, suggestions)
            VALUES (?, ?)`,
          [user_id, suggestions]);
    }

    update(options) {
        const { user_id, autoplay, suggestions} = options
        return this.dao.run(
          `UPDATE options
          SET autoplay = ?,
            suggestions = ?
          WHERE user_id = ?`,
          [autoplay, suggestions, user_id]
        );
    }

    delete(user_id) {
        return this.dao.run(
          `DELETE FROM options WHERE user_id = ?`,
          [user_id]
        );
    }

    getByUser(user) {
        return this.dao.get(
          `SELECT * FROM options WHERE user_id = ?`,
          [user]);
    }

    
}
  
module.exports = optionsRepo;