const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

//mongodb
const mongoose = require('mongoose')
// const User = require('./models/user');

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
// app.use((req, res, next) => {
//   User.findById("5f9d68e4ab0ded2c4dafb70a")
//     .then(user => {
//       req.user = new User(user.name, user.email, user.cart, user._id);
//       next();
//     })
//     .catch(err => {
//       console.log(err);
//     });

// });

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);


//mongo db connection
mongoose
.connect('mongodb+srv://naba:8474840292@onlinestore.pieao.mongodb.net/shop?retryWrites=true&w=majority',  
{useUnifiedTopology: true})
.then(result =>{
  app.listen(3000);
})
.catch(err => {
  console.log(err)
})

