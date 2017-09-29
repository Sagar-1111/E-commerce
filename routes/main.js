const router = require('express').Router();
const Product = require('../models/product');

function paginate(req, res, next){
  const perPage = 9;
  const page = req.params.page - 1;
  Product.find()
    .skip( perPage * page)
    .limit( perPage )
    .populate('category')
    .exec((err, products) => {
      if(err) return next(err);
      Product.count().exec((err, count) => {
        if(err) return next(err);
        res.render('main/product-main', {
          products: products,
          pages: Math.round(count / perPage)
        });
      });
    });
};

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
      const data = results.hits.hits
      res.render('main/search-result', {
        query: req.query.q,
        data: data
      });
    });
  }
});

router.get('/', (req, res, next) => {
  if(req.user) {
    paginate(req, res, next);
  }
  else {
    res.render('main/home');
  }
});

router.get('/page/:page', (req, res, next) => {
  paginate(req, res, next);
})

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
