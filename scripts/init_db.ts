import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./db/db.sqlite3");
db.serialize(() => {
  db.run("DROP TABLE IF EXISTS users;");
  db.run("DROP TABLE IF EXISTS images;");
  db.run("DROP TABLE IF EXISTS manifests;");

  db.run(
    `CREATE TABLE users(
    id TEXT PRIMARY KEY,     
    hash TEXT, 
    salt TEXT,
    createdAt INTEGER
)`
  );

  db.run(
    `CREATE TABLE images(
    id INTEGER PRIMARY KEY AUTOINCREMENT,     
    name TEXT,
    uid TEXT,
    size INTEGER,
    width INTEGER,
    height INTEGER,    
    manifestId TEXT,
    status TEXT,
    createdAt INTEGER
)`
  );

  db.run(
    `CREATE TABLE manifests(
    id TEXT PRIMARY KEY,     
    uid TEXT,
    label TEXT,
    description TEXT,
    metadata JSON,
    attribution TEXT,
    viewingHint TEXT,
    viewingDirection TEXT,
    logo TEXT,
    license TEXT,
    seeAlso TEXT,
    created_at INTEGER
)`
  );
});
db.close();
