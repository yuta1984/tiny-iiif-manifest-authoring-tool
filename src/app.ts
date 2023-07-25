import express from "express";
import session from "express-session";
import expressLayouts from "express-ejs-layouts";
import authRoutes, { requireLogin } from "./routes/auth";
import maniestRoutes from "./routes/manifests";
import imageRoutes from "./routes/images";
import IIIFRouter from "./routes/iiif";
import passport from "passport";
import flash from "connect-flash";
import fileUpload from "express-fileupload";

const app = express();

app.use(expressLayouts);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.header("Access-Control-Allow-Origin", "*");
    next();
  }
);
// public directory
app.use("/public", express.static("public"));

// views engine
app.set("views", __dirname + "/views"); // general config
app.set("view engine", "ejs");

// session
app.use(
  session({
    secret: "keyboard doggo",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);
// authentication
app.use(passport.session());
// flash
app.use(flash());
// fileUpliad
app.use(
  fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
  })
);

app.get("/", (req, res) => {
  return res.redirect("/manifests");
});

// routes
app.use(authRoutes);
app.use("/manifests", maniestRoutes);
app.use("/manifests", imageRoutes);
app.use("/iiif/2", IIIFRouter(2));
app.use("/iiif/3", IIIFRouter(3));

app.listen(3000, () => {
  console.log("Start on port 3000.");
});
