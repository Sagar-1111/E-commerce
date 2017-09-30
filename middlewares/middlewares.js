const Cart = require('../models/cart');
module.exports = (req, res, next) => {
  if(req.user) {
    let total = 0;
    Cart.findOne({ owner: req.user._id })
      .then(cart => {
        if(cart){
          cart.items.forEach((item, index) => {
            total += item.quantity;
          })
          res.locals.cart =total;
        } else {
          res.locals.cart = 0;
        }
        next();
      })
  } else {
    next();
  }
}
