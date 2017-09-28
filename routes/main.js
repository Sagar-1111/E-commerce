const router = require('express').Router();
const Product = require('../models/product');

Product.createMapping(function(err, mapping){
  if(err){
    console.log("error creating mapping");
    console.log(err);
  } else{
    console.log("Mapping Created");
    console.log(mapping);
  }
});

const stream = Product.synchronize();
let count = 0;

stream.on('data', function(){
  count++;
});

stream.on('close', function(){
  console.log("Indexed " + count + " documents");
});

stream.on('error', function(err){
  console.log(err);
});

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

router.get('/product/:id', (req, res, next) => {
  Product.findById({ _id: req.params.id })
    .then(product => {
      res.render('main/product', {
        product: product
      });
    })
    .catch(err => next(err));
})

module.exports = router;
