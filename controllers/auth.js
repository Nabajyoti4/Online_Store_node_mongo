const User = require("../models/user");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const crypto = require("crypto");
const {validationResult} = require('express-validator/check');

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key:
        "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",
    },
  })
);

// get login form
exports.getLogin = (req, res, next) => {
  let message = req.flash("error");

  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: message,
    oldInput : {
      email : '',
      password : ''
    },
    validationErrors : []
  });
};

//send login data
exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);

  if(!errors.isEmpty()){
    return res.status(422)
    .render('auth/login', {
      path : '/login',
      pageTitle : 'Login',
      errorMessage : errors.array()[0].msg,
      oldInput : {
        email : email
      },
      validationErrors : errors.array()
    });
  }

  User.findOne({
    email: email,
  })
    .then((user) => {
      if (!user) {
        return res.status(422)
        .render('auth/login', {
          path : '/login',
          pageTitle : 'Login',
          errorMessage : "Inavlid email or password",
          oldInput : {
            email : email
          },
          validationErrors : []
        });
      }

      bcrypt
        .compare(password, user.password)
        .then((result) => {
          if (result) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save((err) => {
              res.redirect("/");
            });
          }
          return res.status(422)
          .render('auth/login', {
            path : '/login',
            pageTitle : 'Login',
            errorMessage : "Inavlid email or password",
            oldInput : {
              email : email
            },
            validationErrors : []
          });
        })
        .catch((err) => {
          return res.redirect("/login");
        });
    })
    .catch((err) => {
      const error  = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// signup page
exports.postLogout = (req, res, next) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
};

// logout
exports.getSignup = (req, res, next) => {
  let message = req.flash("error");

  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    errorMessage: message,
    oldInput : {
      email : ""
    },
    validationErrors : []
  });
};

//post signup authentication
exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);

  if(!errors.isEmpty()){
    return res.status(422)
    .render('auth/signup', {
      path : '/signup',
      pageTitle : 'Signup',
      errorMessage : errors.array()[0].msg,
      oldInput : {
        email : email
      },
      validationErrors : errors.array()
    });
  }
      return bcrypt
        .hash(password, 12)
        .then((hashPassword) => {
          const user = new User({
            email: email,
            password: hashPassword,
            cart: {
              items: [],
            },
          });
          return user.save();
        })
        .then((result) => {
          res.redirect("/login");
          return transporter.sendMail({
            to: email,
            from: "sirnaba@gmail.com",
            subject: "Signup successfull",
            html: "<h1>Welcome to node-shop Online store</h1>",
          });
        })
        .catch((err) => {
          const error  = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
        })
};

// get rest password page
exports.getReset = (req, res, next) => {
  let message = req.flash("error");

  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset Password",
    errorMessage: message,
  });
};

// post reset
exports.postReset = (req, res, next) => {
  console.log("reset");
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/reset");
    }
    console.log("reset");
    const token = buffer.toString("hex");

    User.findOne({
      email: req.body.email,
    })
      .then((user) => {
        if (!user) {
          req.flash("error", "No account with that email found");
          return redirect("/reset");
        }

        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then((result) => {
        res.redirect("/");
        transporter.sendMail({
          to: req.body.email,
          from: "sirnaba@gmail.com",
          subject: "Password reset",
          html: `<h1>You requested a password reset link</h1>
      <h1>Click this link <a href="http://127.0.0.1:3000/reset/${token}">Link</a> to rest  your password</h1>
      `,
        });
      })
      .catch((err) => {
        const error  = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  });
};

// new password set
exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;

  User.findOne({
    resetToken: token,
    resetTokenExpiration: {
      $gt: Date.now(),
    },
  })
    .then((user) => {
      let message = req.flash("error");


      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      res.render("auth/new-password", {
        path: "/new-password",
        pageTitle: "Reset Password",
        errorMessage: message,
        userId: user._id,
        passwordToken: token,
      });
    })
    .catch((err) => {
      const error  = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

//update the password
exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;

  console.log(userId);

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: {
      $gt: Date.now(),
    },
    _id:userId
  })
    .then((user) => {
      console.log(user);
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then(hashPassword => {
      console.log(hashPassword);
      resetUser.password = hashPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then((result) => {
      res.redirect("/");
    })
    .catch((err) => {
      const error  = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
