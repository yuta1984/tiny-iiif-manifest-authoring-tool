import express from 'express';
import session from 'express-session';
import expressLayouts from 'express-ejs-layouts';
import authRoutes from './routes/auth';
import maniestRoutes from './routes/manifests';
import imageRoutes from './routes/images';
import IIIFRouter from './routes/image_api';
import PresentationAPIRouter from './routes/presentation_api';
import passport from 'passport';
import flash from 'connect-flash';
import fileUpload from 'express-fileupload';
import { PORT } from './config';
import { checkAuth } from './utils/auth';
import { getAllManifestsOrderByCreatedAt } from './utils/db';

const app = express();

app.use(expressLayouts);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
  }
);
// public directory
app.use('/public', express.static('public'));

// views engine
app.set('views', __dirname + '/views'); // general config
app.set('view engine', 'ejs');

// session
app.use(
  session({
    secret: 'keyboard doggo',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);
// authentication
app.use(passport.session());
// flash
app.use(flash());
// fileUpload
app.use(
  fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
  })
);
// pass user to all views
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

app.get('/', checkAuth, async (req, res) => {
  const manifests = await getAllManifestsOrderByCreatedAt();
  return res.render('index', {
    manifests,
    flash: req.flash(),
  });
});

// routes
app.use(authRoutes);
app.use('/manifests', maniestRoutes);
app.use('/manifests', imageRoutes);
app.use('/api/iiif/2', IIIFRouter(2));
app.use('/api/iiif/3', IIIFRouter(3));
app.use('/api/presentation/', PresentationAPIRouter);

app.listen(PORT, () => {
  console.log(`Start on port ${PORT}.`);
});
