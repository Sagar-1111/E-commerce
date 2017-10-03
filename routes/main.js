const router = require('express').Router();
const Product = require('../models/product');
const Cart = require('../models/cart');
const stripe = require('stripe')('sk_test_RtVWGtHcykG3FyyNS1EGhbIq');
const User = require('../models/user');

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

router.get('/cart', (req, res, next) => {
  Cart.findOne({ owner: req.user._id })
    .populate('items.item')
    .then(foundCart => {
      res.render('main/cart', {
        foundCart: foundCart,
        message: req.flash('remove')
      })
    })
    .catch(err => next(err));
});

router.post('/product/:product_id', (req, res, next) => {
  Cart.findOne({ owner: req.user._id })
    .then(cart => {
      cart.items.push({
        item: req.body.product_id,
        price: parseFloat(req.body.priceValue),
        quantity: parseInt(req.body.quantity)
      });
      cart.total = (cart.total + parseFloat(req.body.priceValue)).toFixed(2);
      cart.save()
        .then(cart => res.redirect('/cart'))
        .catch(err => next(err));
    })
    .catch(err => next(err));
});

router.post('/remove', (req, res, next) => {
  Cart.findOne({ owner: req.user._id })
    .then(foundCart => {
      foundCart.items.pull(String(req.body.item));
      foundCart.total = (foundCart.total - parseFloat(req.body.price)).toFixed(2);
      foundCart.save()
        .then(found => {
          req.flash('remove', 'Successfully removed');
          res.redirect('/cart');
        })
        .catch(err => next(err));
    });
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
  Product.findById(req.params.id)
    .then(product => {
      res.render('main/product', {
        product: product
      });
    })
    .catch(err => next(err));
})

router.post('/payment', (req, res, next) => {
  const stripeToken = req.body.stripeToken;
  const currentCharges = Math.round(req.body.stripeMoney * 100);
  stripe.customers.create({
    source: stripeToken
  })
  .then(customer => {
    return stripe.charges.create({
      amount: currentCharges,
      currency: 'usd',
      customer: customer.id
    });
  })
  .then(charge => {
    Cart.findOne({ owner: req.user._id })
      .then(cart => {
        User.findOne({ _id: req.user._id })
          .then(user => {
            cart.items.forEach((item, index) => {
              user.history.push({
                item: item.item,
                paid: item.price
              })
            })
            user.save()
              .then(user => {
                Cart.update({ owner:user._id }, {$set: { items: [], total:0 }})
                  .then(updated => {
                    res.redirect('/profile');
                  })
              })
          })
          .catch(err => next(err));
      })
      .catch(err => next(err));
  })
  .catch(err => next(err));
});

module.exports = router;
