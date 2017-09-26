const router = require('express').Router();
const User = require('../models/user');
const passport = require('passport');
const passportConf = require('../config/passport');

router.get('/login', (req, res) => {
  if(req.user) return res.redirect('/');
  res.render('accounts/login', { message: req.flash('loginMessage')});
});

router.post('/login', passport.authenticate('local-login',{
  successRedirect: '/profile',
  failureRedirect: '/login',
  failureFlash: true
}));

router.get('/profile', (req, res, next) => {
  User.findOne({ _id: req.user._id })
    .then(user => res.render('accounts/profile', { user: user }))
    .catch(err => next(err))
});

router.get('/signup', (req, res, next) =>{
  res.render('accounts/signup', {
    errors: req.flash('errors')
  })
})

router.post('/signup', (req, res, next) => {
  const user = new User();
  user.profile.name = req.body.name;
  user.password = req.body.password;
  user.email = req.body.email;

  User.findOne({ email: req.body.email})
    .then(usr => {
      if(usr){
        req.flash('errors', 'Account with that email address already exists')
        return res.redirect('/signup')
      }
      else {
        user.save()
          .then(user => res.redirect('/'))
          .catch(next);
      }
    });
});

module.exports = router;
