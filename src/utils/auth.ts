import express from 'express';

export function checkAuth(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  if (!req.isAuthenticated()) {
    res.redirect('/login');
  } else {
    return next();
  }
}
