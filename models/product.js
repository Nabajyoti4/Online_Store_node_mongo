const getDb = require('../util/database').getDb;
const mongodb = require('mongodb');

class Product{
  constructor(title, price , description, imageUrl,userId, id){
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
    this.userId = userId;
    this._id = id ? new mongodb.ObjectId(id) : null; 
  } 


  // insert and update data 
  save(){
    const db = getDb();

    if(this._id){
      return db.collection('products')
      .updateOne({
        _id: this._id
      }, {
        $set : this
      })
      .then(result => {
        console.log(result);
      })
      .catch(err => {
        console.log(err);
      });

    }else{
      //Insert a new product
      return db.collection('products')
      .insertOne(this)
      .then(result => {
        console.log(result)
      })
      .catch(err =>{
        console.log(err)
      })
    }
  }

  // get all data
  static fetchAll(){
    const db = getDb();
    return db.collection('products').find().toArray()
    .then(products => {
      return products;
    })
    .catch(err =>{
      console.log(err)
    });
  }

  // find a single product detail
  static findById(prodId){
    const db = getDb();

    return db.collection('products').find(
      {_id: new mongodb.ObjectId(prodId)}
    ).next()
    .then(product => {
      return product;
    })
    .catch(err =>{
      console.log(err)
    });
    
  }


  // delete a single product
  static deleteById(prodId) {
    const db = getDb();

    return db.collection('products')
    .deleteOne({
      _id : new mongodb.ObjectId(prodId)
    })
    .then(result =>{
      console.log("deleted");
    })
    .catch(err => {
      console.log(err);
    })
  }
}



module.exports = Product;
