const express = require('express');
const path = require('path')
const Orders = require('../models/Orders');
const mongoose = require('mongoose')
const {verifyDomain} = require('../utils')
var ordersRouter = express.Router();



const expressAsyncHandler = require('express-async-handler');
const Coupon = require('../models/Coupons');
const Product = require('../models/Product');
const ProductView = require('../models/ProductView');


async function reCalculateQty(arr){
	for(var i=0;i<arr.length;++i){

		var res = await ProductView.findByIdAndUpdate({_id:arr[i].product_id},{ "$inc": { "qty": -arr[i].qty } })
		var res2 = await Product.findOneAndUpdate({detail_id:arr[i].product_id},{ "$inc": { "qty": -arr[i].qty } })
        console.log(res,res2)
	}
	return;
}


async function verifyQty(arr){
	var isValid = true;
	for(var i=0;i<arr.length;++i){

		var res = await ProductView.findById({_id:arr[i].product_id})
		//var res2 = await ProductView.findOne({detail_id:arr[i].product_id})
        if(res.qty > arr[i].qty){
            isValid = false
		    break;
		}
	}
	return isValid;
}



ordersRouter.post('/placeOrder', expressAsyncHandler(async (req, res, next) => {
 
  verifyDomain(req,res)

    try{
      var orderDetails = req.body;
      orderDetails.order_status = "Confirmed"
      orderDetails.order_type="Online"

      var response = await Orders.create(orderDetails);
      res.send(response)
    }
    catch(e){
      res.status(500).send(e)
    }

}))


ordersRouter.post('/placeCodOrder', expressAsyncHandler(async (req, res, next) => {
 
  verifyDomain(req,res)

    try{
      var orderDetails = req.body;
      orderDetails.order_status = "Confirmed",
      orderDetails.order_type="Cash on Delivery"
      var subtotal = 0.0;
      if(!verifyQty(orderDetails.product_id_list)){
        throw new Error({message:"Out of Stock"})
      }
      reCalculateQty(orderDetails.product_id_list)
      for(var i=0;i<orderDetails.products.length;++i){

      
       var product = orderDetails.products[i];
       var prodData = await ProductView.findById({_id:product._id})
        subtotal  = subtotal + prodData.price;
      }


      orderDetails.subtotal = subtotal.toFixed(2);
      
      var response = await Orders.create(orderDetails);
      res.send(response)
    }
    catch(e){
      console.log(e);
      res.status(500).send(e)
    }

}))



ordersRouter.get('/getOrders', expressAsyncHandler(async (req, res, next) => {
  
  try{
    var page = (req.query.page);
    var skip = 0;
    var limit = 20;
    if(page){
    page = parseInt(req.query.page);
    if(page>1){
  
      skip = (page-1) * limit;
    }
    }
    else
    page = 1;
    var orderDetails = req.body;
    var response = await Orders.find({}).skip(skip).limit(limit);
    res.send(response)
  }
  catch(e){
    res.status(500).send(e)
  }

}))




ordersRouter.post('/updateOrder', expressAsyncHandler(async (req, res, next) => {
  verifyDomain(req,res)

  
  try{
    var orderRes = await Orders.findByIdAndUpdate({_id:req.body.id},req.body.orderData,{
      new:true
    })
   // var response = await Orders.find({}).skip(skip).limit(limit);
    res.send(orderRes)
  }
  catch(e){
    res.status(500).send(e)
  }

}))







ordersRouter.post('/createCoupon', expressAsyncHandler(async (req, res, next) => {
 verifyDomain(req,res)
  try{
    var orderRes = await Coupon.create(req.body);
   // var response = await Orders.find({}).skip(skip).limit(limit);
    res.send(orderRes)
  }
  catch(e){
    res.status(500).send(e)
  }

}))





module.exports = ordersRouter;
