import express from "express";
import passport from "passport";
import LocalStrategy from "passport-local";
import crypto from "crypto";
import sqlite3 from "sqlite3";
import { User } from "../types";

const router = express.Router();
const db = new sqlite3.Database("./db/db.sqlite3");

passport.use(
  new LocalStrategy.Strategy(
    { usernameField: "id", passwordField: "password" },
    (id, password, done) => {
      // get user from database
      db.get(`SELECT * FROM users WHERE id = ?`, [id], (err, row) => {
        if (err) {
          return done(err);
        }
        // check if user exists
        if (!row) {
          return done(null, false, { message: "User does not exist." });
        }
        console.log("user found:", row);
        const user = row as User;
        // check if password is correct
        const digest = crypto
          .createHash("sha256")
          .update(password + user.salt)
          .digest("hex");
        if (digest !== user.hash) {
          return done(null, false, { message: "Incorrect password." });
        }
        // return user
        return done(null, user);
      });
    }
  )
);

passport.serializeUser<User>(function (user, cb) {
  process.nextTick(function () {
    const appUser = user as User;
    console.log("serialization", user);
    return cb(null, appUser);
  });
});

passport.deserializeUser<User>(function (user, cb) {
  process.nextTick(function () {
    console.log("deserialization", user);
    return cb(null, user);
  });
});

router.get("/login", (req, res) => {
  res.render("login");
});

router.get("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

router.post(
  "/sessions",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
  })
);

export function requireLogin(req: express.Request, res: express.Response) {
  if (!req.isAuthenticated()) {
    res.redirect("/login");
  }
}

export default router;
