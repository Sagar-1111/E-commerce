const router = require('express').Router();
const Category = require('../models/category');

router.get('/add-category', (req, res, next) => {
  res.render('admin/add-category', { message: req.flash('success') });
});

router.post('/add-category', (req, res, next) => {
  const category = Category();
  category.name = req.body.name;
  category.save()
    .then(category => {
      req.flash('success', 'Successfully Added Category')
      return res.redirect('/add-category');
    })
    .catch(err => next(err));
});

module.exports = router;
