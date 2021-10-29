class userRepo {
    constructor(dao) {
      this.dao = dao;
    }
  
    createTable() {
      const sql = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        password_hash TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE
        )`;
      return this.dao.run(sql);
    }

    create(password_hash, email) {
        return this.dao.run(
          `INSERT INTO users (password_hash, email)
            VALUES (?, ?)`,
          [password_hash, email]);
    }

    delete(id) {
        return this.dao.run(
          `DELETE FROM users WHERE id = ?`,
          [id]
        );
    }

    getByMail(mail) {
        return this.dao.get(
          `SELECT * FROM users WHERE email = ?`,
          [mail]);
    }

    getByMailAndHash(mail, hash) {
        return this.dao.get(
          `SELECT * FROM users WHERE email = ? AND password_hash = ?`,
          [mail, hash]);
    }
}
  
module.exports = userRepo;