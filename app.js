const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

//mongodb
const mongoConnect = require('./util/database').mongoConnect;
const User = require('./models/user');

const errorController = require('./controllers/error');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// find a user at the starting of application
// store it in request
app.use((req, res, next) => {
  User.findById("5f9d68e4ab0ded2c4dafb70a")
    .then(user => {
      req.user = new User(user.name, user.email, user.cart, user._id);
      next();
    })
    .catch(err => {
      console.log(err);
      next();
    });

});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);


//mongo db connection
mongoConnect(() => {
  app.listen(3000);
})