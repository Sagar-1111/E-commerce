const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
const ejs = require('ejs');
const engine = require('ejs-mate');

const mainRoutes = require('./routes/main');
const userRoutes = require('./routes/user');
const app = express();

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://user:root@ds147274.mlab.com:47274/ecommerce', { useMongoClient: true })
  .then(connect => {
    console.log("Connected to Database")
  })
  .catch(err => {
    console.log(err);
  })

app.use(morgan('dev'));
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.use(mainRoutes);
app.use(userRoutes);

app.use((err, req, res, next) => {
  res.status(422).send({ error: err.message });
});

app.listen(3050, err => {
  if(err) throw err;
  console.log("listening on 3050");
});
