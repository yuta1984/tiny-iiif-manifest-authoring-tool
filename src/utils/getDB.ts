import sqlite3 from "sqlite3";
import { open } from "sqlite";

sqlite3.verbose();

const getDB = async () => {
  return await open<sqlite3.Database, sqlite3.Statement>({
    filename: "./db/db.sqlite3",
    driver: sqlite3.Database,
  });
};

export default getDB;
