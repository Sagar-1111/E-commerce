const passport = require('passport');
const router = require('express').Router();
const User = require('../models/user');
const Cart = require('../models/cart');
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
    .populate('history.item')
    .then(foundUser => res.render('accounts/profile', { user: foundUser }))
    .catch(err => next(err));
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
  user.profile.picture = user.gravatar();
  User.findOne({ email: req.body.email})
    .then(existingUser => {
      if(existingUser){
        req.flash('errors', 'Account with that email address already exists')
        return res.redirect('/signup')
      }
      else {
        user.save()
          .then(user => user)
          .then(user => {
            const cart = new Cart();
            cart.owner = user._id;
            cart.save()
              .then(cart => {
                req.logIn(user, function(err){
                  if (err) return next(err);
                  res.redirect('/profile');
                })
              })
              .catch(err => next(err));
          })
          .catch(next);
      }
    });
});

router.get('/logout', (req, res, next) => {
  req.logout();
  res.redirect('/');
});

router.get('/edit-profile', (req, res, next) => {
  res.render('accounts/edit-profile.ejs', {message: req.flash('success')});
});

router.post('/edit-profile', (req, res, next) => {
  User.findOne({ _id: req.user._id })
    .then(user =>{
      if (req.body.name) user.profile.name = req.body.name;
      if (req.body.address) user.address = req.body.address;
      user.save()
        .then(usr => {
          req.flash('success', 'Successfully Edited your profile');
          return res.redirect('/edit-profile');
        })
        .catch(err => next(err))
    })
    .catch(err => next(err))
});

module.exports = router;
