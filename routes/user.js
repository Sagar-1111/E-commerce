const router = require('express').Router();
const User = require('../models/user');

router.get('/signup', (req, res, next) =>{
  res.render('accounts/signup')
})

router.post('/signup', (req, res, next) => {
  const user = new User();
  user.profile.name = req.body.name;
  user.password = req.body.password;
  user.email = req.body.email;

  User.findOne({ email: req.body.email})
    .then(usr => {
      if(usr){
        console.log("User already exists")
        return res.redirect('/signup')
      }
      else {
        user.save()
          .then(user => res.send("New user has been created"))
          .catch(next);
      }
    });
});

module.exports = router;
