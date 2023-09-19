const paymentRoute = require("express").Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");
const ProductView = require('../models/ProductView');
const mongoose = require('mongoose')
const ProductModel = require('../models/Product');





async function reCalculateQty(arr){
	for(var i=0;i<arr.length;++i){

		var res = await ProductView.findByIdAndUpdate({_id:arr[i].product_id},{ "$inc": { "qty": -arr[i].qty } })
		var res2 = await ProductModel.findOneAndUpdate({detail_id:arr[i].product_id},{ "$inc": { "qty": -arr[i].qty } })
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











paymentRoute.post("/orders", async (req, res) => {

	
	var qtyHash={};
	console.log(req.body)
	var productDetails;
	if(req.body.product_id)
	 productDetails = await ProductView.findById({_id:req.body.product_id})
    else if(req.body.product_id_list){
		if(!verifyQty(req.body.product_id_list)){
		throw new Error({message:"Out of Stock"})
	}
		var p_id = req.body.product_id_list;
  
		
		var id_list = [];
		for(var i=0;i<p_id.length;++i){
		  id_list.push(new mongoose.Types.ObjectId(''+p_id[i].product_id));
		  qtyHash[p_id[i].product_id] = p_id[i].qty
		}
		//p_id  = p_id
	  console.log(qtyHash)
		 productDetails = await ProductView.find({
		  '_id': { $in: [
			 ...id_list
		  ]}
		});
		//var productDetails = await ProductView.findById({_id:req.body.product_id})

	}
	try {
		const instance = new Razorpay({
			key_id: process.env.KEY_ID,
			key_secret: process.env.KEY_SECRET,
		});
		let options = {
			
		};
		if(Array.isArray(productDetails) && productDetails.length>0){
			var total=0;
			productDetails.map(val=>{
				console.log(val.price,qtyHash[val._id])
               total+=(val.price*qtyHash[val._id]);
			})
			console.log(total)
		   options = {
				amount: parseInt(total) * 100,
				currency: "INR",
				receipt: crypto.randomBytes(10).toString("hex"),
			};
		}else
		 options = {
			amount: productDetails.price * 100,
			currency: "INR",
			receipt: crypto.randomBytes(10).toString("hex"),
		};

		instance.orders.create(options, (error, order) => {
			if (error) {
				console.log(error);
				return res.status(500).json({ message: "Something Went Wrong!",error });
			}
			res.status(200).json({ data: order });
		});
	} catch (error) {
		res.status(500).json({ message: "Internal Server Error!",error });
		console.log(error);
	}
});

paymentRoute.post("/verify", async (req, res) => {
	try {
		const { razorpay_order_id, razorpay_payment_id, razorpay_signature,prod_arr } =
			req.body;
		const sign = razorpay_order_id + "|" + razorpay_payment_id;
		const expectedSign = crypto
			.createHmac("sha256", process.env.KEY_SECRET)
			.update(sign.toString())
			.digest("hex");

		console.log(req.body);
		console.log(req.razorpay_signature)
		if (razorpay_signature === expectedSign) {
			reCalculateQty(prod_arr)
			return res.status(200).json({ message: "Payment verified successfully" });
		} else {
			return res.status(400).json({ message: "Invalid signature sent!" });
		}
	} catch (error) {
		res.status(500).json({ message: "Internal Server Error!" });
		console.log(error);
	}
});

module.exports = paymentRoute;