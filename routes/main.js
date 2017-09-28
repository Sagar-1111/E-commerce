const router = require('express').Router();
const Product = require('../models/product');

router.get('/', (req, res) => {
  res.render('main/home');
});

router.get('/products/:id', (req, res, next) => {
  Product.find({ category: req.params.id })
    .populate('category')
    .then(products => {
      res.render('main/category', {
        products: products
      })
    })
    .catch(err => next(err));
});

module.exports = router;
