const router = require('express').Router();
const faker = require('faker');
const Category = require('../models/category');
const Product = require('../models/product');

router.post('/search', (req, res, next) => {
  Product.search({
    query_string: { query: req.body.search_term }
  }, (err, results) => {
    if(err) return next(err);
    res.json(results);
  });
});

router.get('/:name', (req, res, next) => {
  Category.findOne({ name: req.params.name })
    .then(category => {
      for(let i = 0; i < 30; i++){
        const product = new Product();
        product.category = category._id;
        product.name = faker.commerce.productName();
        product.price = faker.commerce.price();
        product.image = faker.image.image();
        product.save()
      }
    })
    res.json({ message: 'Success' });
});

module.exports = router;
