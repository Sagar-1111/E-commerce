const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
const ejs = require('ejs');
const engine = require('ejs-mate');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('express-flash');
const MongoStore = require('connect-mongo')(session);
const passport = require('passport');

const cartLength = require('./middlewares/middlewares');
const secret = require('./config/secret');
const mainRoutes = require('./routes/main');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const apiRoutes = require('./api/api');
const Category = require('./models/category');
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
  secret: secret.secretKey,
  store: new MongoStore({ url: secret.database, autoReconnect: true})
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});
app.use(cartLength)
app.use((req, res, next) => {
  Category.find({})
    .then((categories) => {
      res.locals.categories = categories;
      next();
    })
    .catch(err => next(err))
});
app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.use(adminRoutes);
app.use(mainRoutes);
app.use(userRoutes);
app.use('/api', apiRoutes);
app.use((err, req, res, next) => {
  res.status(422).send({ error: err.message });
});
app.listen(secret.port, err => {
  if(err) throw err;
  console.log("listening on " + secret.port);
});
