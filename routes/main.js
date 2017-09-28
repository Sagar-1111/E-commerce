const router = require('express').Router();
const Product = require('../models/product');

Product.createMapping((err, mapping) => {
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

stream.on('data', () => {
  count++;
});

stream.on('close', () => {
  console.log("Indexed " + count + " documents");
});

stream.on('error', err => {
  console.log(err);
});

router.post('/search', (req, res, next) => {
  res.redirect('/search?q=' + req.body.q);
});

router.get('/search', (req, res, next) => {
  if(req.query.q){
    Product.search({ query_string: { query: req.query.q }
    }, (err, results) => {
      if(err) return next(err);
      const data = results.hits.hits.map(hit => {
        return hit;
      });
      res.render('main/search-result', {
        query: req.query.q,
        data: data
      });
    });
  }
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
