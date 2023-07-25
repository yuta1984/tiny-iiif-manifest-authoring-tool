import readline from "readline";
import { Writable } from "stream";
import crypto from "crypto";
import sqlite3 from "sqlite3";

const db = new sqlite3.Database("./db/db.sqlite3");
const username = process.argv[2];
// if username is not provided, exit
if (!username) {
  console.log("Username is required.");
  process.exit(1);
}
// if username is already taken, exit
db.get(`SELECT * FROM users WHERE id = ?`, [username], (err, row) => {
  if (err) {
    console.log(err);
    process.exit(1);
  }
  if (row) {
    console.log("Username is already taken.");
    process.exit(1);
  }
});
// if username does not match regex, exit
if (!username.match(/^[a-zA-Z0-9]+$/)) {
  console.log("Username must be alphanumeric.");
  process.exit(1);
}

let muted = false;
const mutableStdout = new Writable({
  write: function (chunk, encoding, callback) {
    if (!muted) process.stdout.write(chunk, encoding);
    callback();
  },
});

const rl = readline.createInterface({
  input: process.stdin,
  output: mutableStdout,
  terminal: true,
});

muted = false;
rl.question("Password: ", (password: string) => {
  muted = false;
  rl.question("Confirm password: ", (confirm: string) => {
    if (password !== confirm) {
      console.log("Password does not match.");
      process.exit(1);
    }
    muted = true;
    console.log("Creating user...");
    const salt = crypto.randomBytes(16).toString("hex");
    const digest = crypto
      .createHash("sha256")
      .update(password + salt)
      .digest("hex");
    db.run(
      `INSERT INTO users(id, hash, salt, createdAt) VALUES(?, ?, ?, ?)`,
      [username, digest, salt, new Date().getTime()],
      (err) => {
        if (err) {
          console.log(err);
          process.exit(1);
        }
        console.log("User created.");
        process.exit(0);
      }
    );
  });
  muted = true;
});
muted = true;
