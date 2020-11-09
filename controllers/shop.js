const Product = require('../models/product')
const Order = require('../models/order');
const fs = require('fs');
const path = require('path');

// get all products for user
exports.getProducts =  (req, res, next) => {
    Product.find()
    .then(products => {
    res.render('shop/product-list', {
        prods: products,
        pageTitle : 'All Products',
        path : '/products'
    });
  }).catch(err => {
    const error  = new Error(err);
  error.httpStatusCode = 500;
  return next(error);
  });
}

// get all products in index page
exports.getIndex = (req, res, next) => {
   Product.find()
   .then(products => {
    res.render('shop/index', {
      prods: products,
      pageTitle : 'Shop',
      path : '/'

  });
  }).catch(err => {
    const error  = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });

}

// single product detail
exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
  .then((product) => {
    res.render('shop/product-detail', {
      pageTitle : 'Product Detail',
      product : product,
      path : '/products'
  });
  })
  .catch(err =>    {const error  = new Error(err);
  error.httpStatusCode = 500;
  return next(error);
  });
}

// get the user cart
exports.getCart = (req, res, next) => { 
  req.user
  .populate('cart.items.productId')
  .execPopulate()
    .then(user => {
      const products = user.cart.items;
      res.render('shop/cart', {
        pageTitle : 'Cart',
        path : '/cart',
        products : products
    });
    })
  .catch(err => {
    const error  = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  })

}


// add product to cart 
exports.postCart=  (req, res, next) => {
  const prodId = req.body.productId;

  Product.findById(prodId)

  .then(product => {
    return req.user.addToCart(product);
  })
  .then(result => {
    console.log("product Added to Cart");
    res.redirect('/cart');
  })
  .catch(err => {
    const error  = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  })
}

// delete item from cart
exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user.removeFromCart(prodId)
  .then(result => {
    res.redirect('/cart');
  })
  .catch(err => {
    const error  = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  })
}

// create a new order 
exports.postOrder = (req, res, next) => {
  req.user.populate('cart.items.productId')
  .execPopulate()
  .then(user => {
    const products = user.cart.items.map(i => {
      return {
        quantity : i.quantity,
        product: {...i.productId._doc}
      };
    });

   
    const order = new Order({
      user : {
        email : req.user.email,
        userId : req.user
      },
      products : products
    });


    return order.save();
  })
   .then(result => {
     return req.user.clearCart();
    })
    .then(result => {
      res.redirect('/orders');
    })
    .catch(err => {
      console.log(err);
      const error  = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
  });
}

exports.getOrders = (req, res, next) => {
  Order.find({"user.userId" : req.user._id})
  .then(orders => {
    res.render('shop/orders', {
      pageTitle : 'Orders',
      path : '/orders',
      orders : orders
  });
  })
  .catch(err => {
    const error  = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  })

}

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    pageTitle : 'Checkout',
    path : '/checkout',
    isAuthenticated : req.session.isLoggedIn
});
}

//get the invoice page
exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  const invoiceName = 'invoice.pdf';
  const invoicePath = path.join('data', 'invoices', invoiceName);

  fs.readFile(invoicePath, (err, data) => {
    if(err){
      return next(err);
    }

    res.send(data);
  } );
}
