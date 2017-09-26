const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
const ejs = require('ejs');
const engine = require('ejs-mate');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('express-flash');

const secret = require('./config/secret');
const mainRoutes = require('./routes/main');
const userRoutes = require('./routes/user');
const app = express();

mongoose.Promise = global.Promise;

mongoose.connect(secret.database, { useMongoClient: true })
  .then(connect => {
    console.log("Connected to Database")
  })
  .catch(err => {
    console.log(err);
  })

app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: secret.secretKey
}));
app.use(flash());
app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.use(mainRoutes);
app.use(userRoutes);

app.use((err, req, res, next) => {
  res.status(422).send({ error: err.message });
});

app.listen(secret.port, err => {
  if(err) throw err;
  console.log("listening on " + secret.port);
});
