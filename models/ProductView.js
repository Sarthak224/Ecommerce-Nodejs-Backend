const mongoose = require('mongoose');

const productViewSchema = new mongoose.Schema({
id:{type:Number},
title:{type:String},
price:{type:Number},
original_price:{type:Number},

description:{type:String},
category:{type:String},
image:{type:Array},
rating:{type:Object},
additional_details:{type:String},
other_details:{type:String},
specifications:{type:String},
qty:{type:Number},
mainCategory:{type:String}

});

    

const ProductView = mongoose.model('ProductDetails', productViewSchema);

module.exports = ProductView;
