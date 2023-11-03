const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
firstname:{type:String},
lastname:{type:String},
address:{type:String},
state:{type:String},
city:{type:String},
zipcode:{type:Number},
phone:{type:String},
email:{type:String},
order_notes:{type:String},
subtotal:{type:Number},
products:{type:Object},
payment_details:{type:Object},
order_status:{type:String},
order_type:{type:String},
date:{type:String}

});

    

const Orders = mongoose.model('Orders', orderSchema);

module.exports = Orders;
