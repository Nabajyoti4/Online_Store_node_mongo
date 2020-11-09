
const Product = require("../models/product");
const {validationResult} = require('express-validator/check');
const fileHelper = require('../util/file');
// get products for admin
exports.getProducts = (req, res, next) => {

  Product.find({
    userId : req.user._id
  })
    .then((products) => {
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products"
      });
    })
    .catch((err) => {
      const error  = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

//get the add product from page
exports.getAddProduct = (req, res, next) => {

  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    hasError : false,
    errorMessage : null
  });
};

//add products in database
exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;

  if(!image){
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing : false,
      hasError : true,
      product: { 
        title : title,
        price: price,
        description : description
      },
      errorMessage : 'Attached file is not an image'
    });
  }

  const errors =  validationResult(req);

  if(!errors.isEmpty()){
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing : false,
      hasError : true,
      product: {
        title : title,
        price: price,
        description : description
      },
      errorMessage : errors.array()[0].msg
    });
  }

  const imageUrl = image.path;

  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    userId : req.user
  }); 

  product
    .save()
    .then((result) => {
      res.redirect("/admin/products");
    })
    .catch((err) => {
      const error  = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
      });
};

//get the edit product page
exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;

  if (!editMode) {
    return res.redirect("/");
  }

  const prodId = req.params.productId;

  Product.findById(prodId)
    .then((product) => {
    
      if (!product) {
        return res.redirect("/");
      }
      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: editMode,
        product: product,
        hasError : false,
        errorMessage : null
      });
    })
    .catch((err) => {
      const error  = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// update the product in database
exports.postEditProducts = (req, res, next) => { 
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const image = req.file;
  const updatedDesc = req.body.description;
  const errors = validationResult(req);

  if(!errors.isEmpty()){
    return res.render("admin/edit-product", {
      pageTitle: "EditProduct",
      path: "/admin/edit-product",
      editing : true,
      hasError : true,
      product: {
        title : updatedTitle,
        price: updatedPrice,
        description : updatedDesc,
        _id : prodId
      },
      errorMessage : errors.array()[0].msg
    });
  }

  Product.findById(prodId)
    .then((product) => {

      if(product.userId.toString() !== req.user._id.toString()){
        return res.redirect('/');
      }

      product.title = updatedTitle;
      product.description = updatedDesc;
      product.price = updatedPrice;
      if(image){
        fileHelper.deleteFile(product.imageUrl);
        product.imageUrl = image.path;
      }else{

      }
    

      return product.save()
      .then((result) => {
        console.log("Updated Product");
        res.redirect("/admin/products");
      });
    })
    .catch((err) =>{
      const error  = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// delete product
exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
  .then(prod => {
    fileHelper.deleteFile(prod.imageUrl);
    return Product.findByIdAndRemove(prodId);
  })
   .then((result) => {
      console.log("Product Deleted");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      const error  = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
