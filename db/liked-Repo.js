class likedRepo {
    constructor(dao) {
      this.dao = dao;
    }
  
    createTable() {
      const sql = `
      CREATE TABLE IF NOT EXISTS liked (
        user_id INTEGER NOT NULL,
        song_id INTEGER NOT NULL,
        PRIMARY KEY ( user_id, song_id),
        FOREIGN KEY(user_id) REFERENCES Users(id)
        )`;
      return this.dao.run(sql);
    }

    create(user_id, song_id) {
        return this.dao.run(
          `INSERT INTO liked (user_id, song_id)
            VALUES (?, ?)`,
          [user_id, song_id]);
    }

    delete(user_id) {
        return this.dao.run(
          `DELETE FROM liked WHERE user_id = ?`,
          [user_id]
        );
    }

    getByUserAndSong(user,song) {
        return this.dao.get(
          `SELECT COUNT(*) AS count FROM liked WHERE user_id = ? AND song_id = ?`,
          [user,song]);
    }

    getAll(id) {
        return this.dao.all(
         `SELECT * FROM liked WHERE user_id = ?`,
         [id]);
    }
}
  
module.exports = likedRepo;