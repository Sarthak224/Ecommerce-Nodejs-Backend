const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
id:{type:Number},
title:{type:String},
price:{type:Number},
description:{type:String},
category:{type:String},
image:{type:String},
rating:{type:Object},
detail_id:{type:  mongoose.Schema.Types.ObjectId, ref: 'ProductDetails', required: true },
original_price:{type:Number},
qty:{type:Number},
mainCategory:{type:String}

});

    

const Product = mongoose.model('Products', productSchema);

module.exports = Product;
