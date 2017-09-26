const router = require('express').Router();
const User = require('../models/user');

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
