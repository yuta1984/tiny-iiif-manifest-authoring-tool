import sqlite3 from "sqlite3";

const db = new sqlite3.Database("./db/db.sqlite3");
const username = process.argv[2];

db.serialize(() => {
  // check if user exists
  db.get(`SELECT * FROM users WHERE id = ?`, [username], (err, row) => {
    if (err) {
      console.log(err);
      process.exit(1);
    }
    if (!row) {
      console.log("User does not exist.");
      process.exit(1);
    }
  });
  // delete user
  db.run(`DELETE FROM users WHERE id = ?`, [username], (err) => {
    if (err) {
      console.log(err);
      process.exit(1);
    }
    console.log("User deleted.");
  });
});
db.close();
