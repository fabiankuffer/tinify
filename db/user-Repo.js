//all users with hashed-password and email address are stored in this table
class userRepo {
    constructor(dao) {
      this.dao = dao;
    }
    
    //creates table if not exists
    createTable() {
      const sql = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        password_hash TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE
        )`;
      return this.dao.run(sql);
    }

    //creates user
    create(password_hash, email) {
        return this.dao.run(
          `INSERT INTO users (password_hash, email)
            VALUES (?, ?)`,
          [password_hash, email]);
    }

    //deletes user
    delete(id) {
        return this.dao.run(
          `DELETE FROM users WHERE id = ?`,
          [id]
        );
    }

    //get user infos by the email adress
    getByMail(mail) {
        return this.dao.get(
          `SELECT * FROM users WHERE email = ?`,
          [mail]);
    }

    //get user infos by the email adress and the passwordhash
    getByMailAndHash(mail, hash) {
        return this.dao.get(
          `SELECT * FROM users WHERE email = ? AND password_hash = ?`,
          [mail, hash]);
    }
}
  
module.exports = userRepo;