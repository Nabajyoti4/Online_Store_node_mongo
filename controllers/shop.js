const Product = require('../models/product')

// get all products for user
exports.getProducts =  (req, res, next) => {
    Product.fetchAll()
    .then(products => {
    res.render('shop/product-list', {
        prods: products,
        pageTitle : 'All Products',
        path : '/products'
    });
  }).catch(err => {
    console.log(err);
  });
}

// get all products in index page
exports.getIndex = (req, res, next) => {
   Product.fetchAll()
   .then(products => {
    res.render('shop/index', {
      prods: products,
      pageTitle : 'Shop',
      path : '/'
  });
  }).catch(err => {
    console.log(err);
  });

}

// get the user cart
exports.getCart = (req, res, next) => { 
  req.user.getCart()
    .then(products => {
      res.render('shop/cart', {
        pageTitle : 'Cart',
        path : '/cart',
        products : products
    });
    })
  .catch(err => {
    console.log(err);
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
    console.log(err);
  })
}

// delete item from cart
exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user. deleteItemFromCart(prodId)
  .then(result => {
    res.redirect('/cart');
  })
  .catch(err => {
    console.log(err)
  })
}

exports.postOrder = (req, res, next) => {
  let fetchedCart;
    req.user
    .addOrder()
    .then(result => {
      res.redirect('/orders');
    })
    .catch(err => {
      console.log(err)
  });
}

exports.getOrders = (req, res, next) => {
  req.user.getOrders()
  .then(orders => {
    console.log(orders);
    res.render('shop/orders', {
      pageTitle : 'Orders',
      path : '/orders',
      orders : orders
  });
  })
  .catch(err => {
    console.log(err)
  })

}

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    pageTitle : 'Checkout',
    path : '/checkout'
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
  }).catch(err => console.log(err));
}