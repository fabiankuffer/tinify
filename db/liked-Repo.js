//likedrepo is used to store liked songs in the db so that they are not displayed twice
class likedRepo {
    constructor(dao) {
      this.dao = dao;
    }
  
    //create necessary table if not exists
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

    //create an entry into the table
    create(user_id, song_id) {
        return this.dao.run(
          `INSERT INTO liked (user_id, song_id)
            VALUES (?, ?)`,
          [user_id, song_id]);
    }

    //delete all entries from the table for the specific user
    delete(user_id) {
        return this.dao.run(
          `DELETE FROM liked WHERE user_id = ?`,
          [user_id]
        );
    }

    //check if the song is allready in the table
    getByUserAndSong(user,song) {
        return this.dao.get(
          `SELECT COUNT(*) AS count FROM liked WHERE user_id = ? AND song_id = ?`,
          [user,song]);
    }

    //get all songs from the table for the specific user
    getAll(id) {
        return this.dao.all(
         `SELECT * FROM liked WHERE user_id = ?`,
         [id]);
    }
}
  
module.exports = likedRepo;