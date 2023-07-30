import express from 'express';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import crypto from 'crypto';
import { User } from '../types';
import {
  getUserById,
  updateUserPassword,
} from '../utils/db';
import logger from '../utils/logger';
import { checkAuth } from '../utils/auth';

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
  res.render('auth/login', { flash: req.flash() });
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

router.get('/change_password', checkAuth, (req, res) => {
  res.render('auth/change_password', {
    flash: req.flash(),
  });
});

router.post(
  '/change_password',
  checkAuth,
  async (req, res) => {
    const user = req.user!;
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;
    const newPassword2 = req.body.newPassword2;
    // check if old password is correct
    const digest = crypto
      .createHash('sha256')
      .update(oldPassword + user.salt)
      .digest('hex');
    if (digest !== user.hash) {
      req.flash('danger', 'Incorrect password.');
      logger.error('Incorrect password', { user });
      return res.redirect('/change_password');
    }
    // check if new password is valid
    if (newPassword.length < 4) {
      req.flash(
        'danger',
        'New password must be at least 4 characters long.'
      );
      logger.error('New password too short', { user });
      return res.redirect('/change_password');
    }
    // check if new passwords match
    if (newPassword !== newPassword2) {
      req.flash('danger', 'New passwords do not match.');
      logger.error('New passwords do not match', { user });
      return res.redirect('/change_password');
    }
    // check if new password is different from old password
    if (oldPassword === newPassword) {
      req.flash(
        'danger',
        'New password must be different.'
      );
      logger.error('New password must be different', {
        user,
      });
      return res.redirect('/change_password');
    }
    // update password
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto
      .createHash('sha256')
      .update(newPassword + salt)
      .digest('hex');
    // update user
    await updateUserPassword(user.id, hash, salt);
    logger.info('Password changed', { user });
    req.flash('info', 'Password changed.');
    return res.redirect('/');
  }
);

export default router;
