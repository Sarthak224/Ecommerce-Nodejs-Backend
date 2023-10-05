const express = require('express');
// const path = require('path')
// const Orders = require('../models/Orders');
// const mongoose = require('mongoose')
const {verifyDomain} = require('../utils')
var cartRouter = express.Router();



const expressAsyncHandler = require('express-async-handler');
// const Product = require('../models/Product');
const ProductView = require('../models/ProductView');





async function verifyQty(arr){
	var isValid = true;
    verifiedProductMapping = {};
	for(var i=0;i<arr.length;++i){

		var res = await ProductView.findById({_id:arr[i].product_id})
		//var res2 = await ProductView.findOne({detail_id:arr[i].product_id})
        if(res.qty > arr[i].qty){
          verifiedProductMapping[arr[i].product_id] = false;
		}
        else
        verifiedProductMapping[arr[i].product_id] = true;

	}
	return verifiedProductMapping;
}



cartRouter.post('/verifyCart', expressAsyncHandler(async (req, res, next) => {
 
  verifyDomain(req,res)

    try{
     var data = verifyQty();
     res.json({data});
    }
    catch(e){
      res.status(500).send(e)
    }

}))


module.exports = cartRouter;
