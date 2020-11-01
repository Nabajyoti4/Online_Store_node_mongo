// const getDb = require('../util/database').getDb;
// const mongodb = require('mongodb');
// const { get } = require('../routes/shop');

// const ObjectId = mongodb.ObjectId;

// class User {
//   constructor(username, email, cart, id){
//     this.name = username;
//     this.email = email;
//     this.cart = cart; //{ items : []}
//     this._id = id;
//   }


//  /**
//   * save user 
//   */
//   save(){

//     const db = getDb();

//     return db.collection('users')
//     .insertOne(this)
//     .then(result => {
//       console.log(result);
//     })
//     .catch(err => {
//       console.log(err)
//     })

//   }

//   /**
//    * add or update cart in user
//    * @param {product} product 
//    */
//   addToCart(product){

//     // check for same product in cart with the product id
//     //get the postition of the existing product if found

//     const cartProductIndex = this.cart.items.findIndex(cartProductId =>{
//       return cartProductId.productId.toString() === product._id.toString();
//     });

//     console.log(cartProductIndex);

    
//     let newQuantity = 1;

//     //copy the cart items from the cart of user
//     const updatedCartItems = [...this.cart.items];
    
//     // if product exists
//     if(cartProductIndex >= 0){
//       // increase the old product quantity by adding one to the quantity
//       newQuantity = this.cart.items[cartProductIndex].quantity + 1;
      
//       //update the quantity with the new quantity
//       updatedCartItems[cartProductIndex].quantity = newQuantity;
//     }
//     // if the item is not in the cart
//     else{
//       // push the new  product id and quantity 
//       updatedCartItems.push({
//         productId : new mongodb.ObjectId(product._id),
//         quantity : newQuantity
//       })
//     }
    
//     // store the new items in the cart
//     const updatedCart = {
//       items : updatedCartItems
//     };

//     console.log(updatedCart)

//     const db = getDb();

//     // update the user cart with new 
//     return db.collection('users')
//     .updateOne({
//       _id : new mongodb.ObjectId(this._id)
//     },{
//       $set : {cart : updatedCart}
//     })


//   }



//   /**
//    * get product from user cart
//    */
//   getCart(){
//     const db = getDb();

//     //get products id from user cart 
//     const productIds = this.cart.items.map(i => {
//       return i.productId;
//     })

//     return db.collection('products').find({
//       _id : {
//         $in: productIds
//       }
//     }).toArray()
//     .then(products => {
//       return products.map(p => {
//         return {
//           ...p,
//           quantity : this.cart.items.find(i => {
//             return i.productId.toString() === p._id.toString();
//           }).quantity
//         }
//       })
//     })
//   }


//   /**
//    * delete product from user cart
//    * @param {*} prodId 
//    */
//   deleteItemFromCart(productId){

//     // filter the items and remove the product from the cart
//     const updatedCartItems = this.cart.items.filter(item => {
//       return item.productId.toString() !== productId.toString();
//     });

//     //update the cart with new items
//     const db = getDb();

//     // update the user cart with new 
//     return db.collection('users')
//     .updateOne({
//       _id : new mongodb.ObjectId(this.id)
//     },{
//       $set : {cart : {
//         items : updatedCartItems
//       }}
//     })


//   }


//   /**
//    * add order in new collection
//    */
//   addOrder(){
//     const db = getDb();

//     console.log(ObjectId(this._id));

//     // get products from user cart
//     return this.getCart()
//     .then(products => {
//       //create a order with full product details and user
//       const order = {
//         items : products,
//         user : {
//           _id : new ObjectId(this._id),
//           name : this.name
//         }
//       };
//       //store the order
//       return db.collection('orders')
//       .insertOne(order)
//     })
//     .then(result => {
//       this.cart = {
//         items : []
//       };
//       return db.collection('users')
//       .updateOne({
//         _id: new mongodb.ObjectId(this._id)
//       },
//       {
//         $set : {
//           cart : {
//             items : []
//           }
//         }
//       })
//     })
//   }


//   /**
//    * get orders of the user
//    */
//   getOrders(){
//     const db = getDb();
//     return db.collection('orders')
//     .find({
//       'user._id' : new mongodb.ObjectId(this._id)
//     })
//     .toArray()
//   }



//   /**
//    * get user by id
//    * @param {*} userId 
//    */
//   static findById(userId){
//     const db = getDb();

//     return db
//     .collection('users')
//     .find(
//       {_id: new mongodb.ObjectId(userId)}
//     ).next()
//     .then(product => {
//       return product;
//     })
//     .catch(err =>{
//       console.log(err)
//     });
//   }
// }



// module.exports = User;
