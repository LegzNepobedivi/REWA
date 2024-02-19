if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const mongoSanitize = require("express-mongo-sanitize");

const Joi = require("joi");
const { stanSchema, agentSchema } = require("./schemas.js");
const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError");
const methodOverride = require("method-override");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const User = require("./models/user");
// const Stan = require("./models/stan");
// const Review = require("./models/review");
// const { error } = require("console");

const userRoutes = require("./routes/users");
const stanRoutes = require("./routes/stanovi.js");
const agentRoutes = require("./routes/agenti.js");
const { default: helmet } = require("helmet");

const MongoStore = require("connect-mongo");

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
  console.log("Database connected");
});

const app = express();
const port = 3000;

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(mongoSanitize());

const store = MongoStore.create({
  mongoUrl: process.env.MONGO_URI,
  touchAfter: 24 * 60 * 60,
  crypto: {
    secret: process.env.SECRET,
  },
});

store.on("error", function (err) {
  console.log("SESSION STORE ERROR", e);
});

const sessionConfig = {
  store: store,
  name: "session",
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    //secure: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));
app.use(flash());

// CONTENT SECURITY CONFIG

const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net/",
  "https://code.jquery.com/",
  "https://www.w3schools.com",
  "https://maxcdn.bootstrapcdn.com/",
  "https://mdbootstrap.com/",
  "https://www.youtube.com/",

];
//This is the array that needs added to
const styleSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://kit-free.fontawesome.com/",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net/",
  "https://cdnjs.cloudflare.com/",
  "https://maxcdn.bootstrapcdn.com/bootstrap",
  "https://www.w3schools.com",
  "https://maxcdn.bootstrapcdn.com/",
  "https://mdbootstrap.com/",
];
const connectSrcUrls = [
  "https://api.mapbox.com/",
  "https://a.tiles.mapbox.com/",
  "https://b.tiles.mapbox.com/",
  "https://events.mapbox.com/",
  "https://www.youtube.com/",
];
const fontSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://kit-free.fontawesome.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net/",
  "https://cdnjs.cloudflare.com/",
  "https://maxcdn.bootstrapcdn.com/bootstrap",
  "https://www.w3schools.com",
  "https://maxcdn.bootstrapcdn.com/",
  "https://fonts.gstatic.com",
  "https://mdbootstrap.com/",
];
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`, //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
        "https://images.unsplash.com/",
        "https://mdbootstrap.com/",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);

//app.use(helmet({ contentSecurityPolicy: true }));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.use("/agenti", agentRoutes);
app.use("/", userRoutes);
app.use("/stanovi", stanRoutes);
//app.use("/stanovi/:id/agents", agentRoutes);

app.get("/", (req, res) => {
  res.render("home");
});

// app.get("/mapa", (req, res) => {
//   res.render("mapa");
// });

app.all("*", (req, res, next) => {
  next(new ExpressError("Page not found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Oh no something went wrong!";
  res.status(statusCode).render("error", { err });
});

app.listen(port, () => {
  console.log(`listening on ${port}`);
});
