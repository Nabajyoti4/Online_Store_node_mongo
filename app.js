// app requirements
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require('csurf');
const flash = require('connect-flash');

//mongodb
const mongoose = require("mongoose");
const User = require("./models/user");

// controllers
const errorController = require("./controllers/error");

const MONGODB_URI =
  "mongodb+srv://naba:8474840292@onlinestore.pieao.mongodb.net/shop?retryWrites=true&w=majority";

// express setup
const app = express();
const store = MongoDBStore({
  uri: MONGODB_URI,
  collection: "sessions",
});

// setup csrf
const csrfProtection = csrf();

// template engine
app.set("view engine", "ejs");
app.set("views", "views");

// routes models
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

// middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);


app.use(csrfProtection);
app.use(flash());

// store User model provided by mongoose insession
app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => {
      console.log(err);
    });
});

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn,
  res.locals.csrfToken = req.csrfToken()
  next()
})

// routes
app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(errorController.get404);

//mongo db connection
mongoose
  .connect(MONGODB_URI, { useUnifiedTopology: true })
  .then((result) => {
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
