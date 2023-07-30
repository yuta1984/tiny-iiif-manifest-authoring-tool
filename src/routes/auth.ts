import express from 'express';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import crypto from 'crypto';
import { User } from '../types';
import { getUserById } from '../utils/db';
import logger from '../utils/logger';

const router = express.Router();

passport.use(
  new LocalStrategy.Strategy(
    { usernameField: 'id', passwordField: 'password' },
    async (id, password, done) => {
      try {
        const user = await getUserById(id);
        if (!user) {
          return done(null, false, {
            message: 'User does not exist.',
          });
        }
        const digest = crypto
          .createHash('sha256')
          .update(password + user.salt)
          .digest('hex');
        if (digest !== user.hash) {
          return done(null, false, {
            message: 'Incorrect password.',
          });
        }
        // return user
        logger.info('logged in successfully', { user });
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser<User>(function (user, cb) {
  process.nextTick(function () {
    const appUser = user as User;
    return cb(null, appUser);
  });
});

passport.deserializeUser<User>(function (user, cb) {
  process.nextTick(function () {
    return cb(null, user);
  });
});

router.get('/login', (req, res) => {
  res.render('login', { flash: req.flash() });
});

router.get('/logout', (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.flash('info', 'You have been logged out.');
    res.redirect('/');
  });
});

router.post(
  '/sessions',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
  })
);

export default router;
