
//require('dotenv').config()

const formidable=require('formidable')
const express=require('express')
const phonePe=express.Router()
const sha256 = require("sha256");
const axios = require("axios");

const {v4:uuidv4}=require('uuid')
const uniqid = require("uniqid");
const PaytmChecksum=require('./PaytmChecksum')
const crypto = require("crypto");
const ProductView = require('../models/ProductView');
const mongoose = require('mongoose')
const ProductModel = require('../models/Product');
const Orders = require('../models/Orders');

const MERCHANT_ID = "PGTESTPAYUAT86";
const PHONE_PE_HOST_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox";
const SALT_INDEX = 1;
const SALT_KEY = "96434309-7796-489d-8924-ab56988a6076";
const APP_BE_URL = "http://localhost:3011/api/payment2"; // our application

// MID: PGTESTPAYUAT86 Salt Index: 1 Salt Key: 96434309-7796-489d-8924-ab56988a6076


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





phonePe.get("/", (req, res) => {
    res.send("PhonePe Integration APIs!");
  });

  function getCurrentDateForOrder(){

    var today = new Date().toDateString()
    
    return today;
    }


  
  // endpoint to initiate a payment
  phonePe.post("/pay", async function (req, res, next) {
    // Initiate a payment
  
    // Transaction amount
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

    let amount = 0;
    for(var i=0;i<productDetails.length;++i){
      amount = parseFloat(amount + (productDetails[i].price*qtyHash[productDetails[i]._id]))
    }





    let merchantTransactionId = uniqid();

    var orderDetails = req.body;
      orderDetails.order_status = "Pending Payment"
      orderDetails.order_type="Online"
      orderDetails.date = getCurrentDateForOrder();
      orderDetails.createdAt = new Date().toString();
      orderDetails.phonepe_payment_details = {}
      orderDetails.subtotal = amount
      orderDetails.phonepe_payment_details.merchantTransactionId = merchantTransactionId;

    var response = await Orders.create(orderDetails);
    //return res.json({productDetails,amount});
    // User ID is the ID of the user present in our application DB
    let userId = "MUID123";
  
    // Generate a unique merchant transaction ID for each transaction
    // let merchantTransactionId = uniqid();
  
    // redirect url => phonePe will redirect the user to this url once payment is completed. It will be a GET request, since redirectMode is "REDIRECT"
    let normalPayLoad = {
      merchantId: MERCHANT_ID, //* PHONEPE_MERCHANT_ID . Unique for each account (private)
      merchantTransactionId: merchantTransactionId,
      merchantUserId: userId,
      amount: amount * 100, // converting to paise
      redirectUrl: `${APP_BE_URL}/payment/validate/${merchantTransactionId}`,
      redirectMode: "REDIRECT",
      mobileNumber: "9999999999",
      paymentInstrument: {
        type: "PAY_PAGE",
      },
    };
  
    // make base64 encoded payload
    let bufferObj = Buffer.from(JSON.stringify(normalPayLoad), "utf8");
    let base64EncodedPayload = bufferObj.toString("base64");
  
    // X-VERIFY => SHA256(base64EncodedPayload + "/pg/v1/pay" + SALT_KEY) + ### + SALT_INDEX
    let string = base64EncodedPayload + "/pg/v1/pay" + SALT_KEY;
    let sha256_val = sha256(string);
    let xVerifyChecksum = sha256_val + "###" + SALT_INDEX;
  
    axios
      .post(
        `${PHONE_PE_HOST_URL}/pg/v1/pay`,
        {
          request: base64EncodedPayload,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-VERIFY": xVerifyChecksum,
            accept: "application/json",
          },
        }
      )
      .then(function (response) {
        console.log("response->", JSON.stringify(response.data));
        res.json({url:response.data.data.instrumentResponse.redirectInfo.url});
      })
      .catch(function (error) {
        res.send({success:"false",error});
      });
  });
  
  // endpoint to check the status of payment
  phonePe.get("/payment/validate/:merchantTransactionId", async function (req, res) {
    const { merchantTransactionId } = req.params;
    // check the status of the payment using merchantTransactionId
    if (merchantTransactionId) {
      let statusUrl =
        `${PHONE_PE_HOST_URL}/pg/v1/status/${MERCHANT_ID}/` +
        merchantTransactionId;
  
      // generate X-VERIFY
      let string =
        `/pg/v1/status/${MERCHANT_ID}/` + merchantTransactionId + SALT_KEY;
      let sha256_val = sha256(string);
      let xVerifyChecksum = sha256_val + "###" + SALT_INDEX;
  
      axios
        .get(statusUrl, {
          headers: {
            "Content-Type": "application/json",
            "X-VERIFY": xVerifyChecksum,
            "X-MERCHANT-ID": merchantTransactionId,
            accept: "application/json",
          },
        })
        .then(async function (response) {
          // console.log("Verify response->", response.data.data);
          if (response.data && response.data.code === "PAYMENT_SUCCESS") {
            //merchantTransactionId
            var pendingOrder = await Orders.findOneAndUpdate({'phonepe_payment_details.merchantTransactionId':response.data.data.merchantTransactionId},{order_status : "Confirmed"},{
              new:true,
            })
            
            console.log(pendingOrder)
            // redirect to FE payment success status page
            //res.send({phonepe:response.data,pendingOrder});

            res.redirect('http://localhost:3000/checkout/success')
          } else {
            // redirect to FE payment failure / pending status page
          }
        })
        .catch(function (error) {
          // redirect to FE payment failure / pending status page
          res.send(error);
        });
    } else {
      res.send({error:"payment failed"});
    }
  });

module.exports=phonePe