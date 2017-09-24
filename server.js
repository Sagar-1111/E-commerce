const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const bodyparser = require('body-parser');

const User = require('./models/user');
const app = express();

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://user:root@ds147274.mlab.com:47274/ecommerce', err => {
  if(err){
    console.log('err', err);
  }
  console.log('Connected to Database');
})

app.use(morgan('dev'));
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

app.post('/create-user', (req, res, next) => {
  const user = new User();
  user.profile.name = req.body.name;
  user.password = req.body.password;
  user.email = req.body.email;
  user.save()
    .then(driver => res.send(driver))
    .catch(next);
});

app.listen(3050, err => {
  if(err) throw err;
  console.log("listening on 3050");
});
