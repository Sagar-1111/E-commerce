const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
const ejs = require('ejs');
const engine = require('ejs-mate');

const User = require('./models/user');
const app = express();

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://user:root@ds147274.mlab.com:47274/ecommerce', err => {
  if(err){
    console.log('err', err);
  }
  console.log('Connected to Database');
})

app.use(express.static(__dirname + 'public'));
app.use(morgan('dev'));
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.engine('ejs', engine);
app.set('view engine', 'ejs');

app.post('/create-user', (req, res, next) => {
  const user = new User();
  user.profile.name = req.body.name;
  user.password = req.body.password;
  user.email = req.body.email;
  user.save()
    .then(user => res.send(user))
    .catch(next);
});

app.get('/', (req, res) => {
  res.render('main/home');
});

app.listen(3050, err => {
  if(err) throw err;
  console.log("listening on 3050");
});
