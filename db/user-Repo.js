class userRepo {
    constructor(dao) {
      this.dao = dao;
    }
  
    createTable() {
      const sql = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        password_hash TEXT NOT NULL,
        login_token TEXT UNIQUE,
        salt TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE
        )`;
      return this.dao.run(sql);
    }

    create(password_hash, salt, email, login_token) {
        return this.dao.run(
          `INSERT INTO users (password_hash, salt, email, login_token)
            VALUES (?, ?, ?)`,
          [password_hash, salt, email, login_token]);
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

    getByLoginToken(login_token){
        return this.dao.get(
            `SELECT * FROM users WHERE login_token = ?`,
            [login_token]);
    }
}
  
module.exports = userRepo;