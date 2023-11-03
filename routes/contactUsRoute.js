const express = require('express');
const Admins = require('../models/Admins')
const mongoose = require('mongoose')
const multer  = require('multer')
const {verifyDomain} = require('../utils')
const jwt = require('jsonwebtoken');
var contactRouter = express.Router();
const expressAsyncHandler = require('express-async-handler');


//Create img path

const nodemailer = require("nodemailer");
const UserMeta = require('../models/UserMeta');

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "smadhwal13@gmail.com",//"2littleclay@gmail.com",
    pass: "mghn fgye oghk folw",
  },
});








contactRouter.post('/', expressAsyncHandler(async (req, res, next) => {

try{
   
  var {email,title,msg} = req.body;
   
    const info = await transporter.sendMail({
        from: '"Sarthak Madhwal" <smadhwal13@gmail.com>', // sender address
        to: "sarthakcreed68@gmail.com", // list of receivers
        subject: "Hello P✔", // Subject line
        text: "Hello world?", // plain text body
        html: "<b>Hello world?</b>", // html body
      });
    
      console.log("Message sent: %s", info.messageId);
      res.send({msg:"Message Sent",success:true})
}catch(e){
    
    res.sendStatus(500).send(e);

}

}))





contactRouter.post('/verifyEmail', expressAsyncHandler(async (req, res, next) => {

  try{
     
    var {email} = req.body;
     
    const randomOtp = Math.floor(100000 + Math.random() * 900000);

    var res1 = await UserMeta.deleteMany({email});
    res1 = await UserMeta.create({email,otp:randomOtp,timestamp:Date.now()});

      const info = await transporter.sendMail({
          from: '"Vinkee Bhasiin Ceramics" <smadhwal13@gmail.com>', // sender address
          to: email, // list of receivers
          subject: "Email Verification", // Subject line
          text: "Verify your email", // plain text body
          html: `<p>Otp for email verification is <b>${randomOtp}</b> </p>`, // html body
        });
      
        console.log("Message sent: %s", info.messageId);
        res.json({msg:"Message Sent",success:true})
  }catch(e){
      
      res.sendStatus(500).send(e);
  
  }
  
  }))



  contactRouter.post('/verifyEmailOtp', expressAsyncHandler(async (req, res, next) => {

    try{
       
      var {email,otp} = req.body;
       
      
      //const randomOtp = Math.floor(100000 + Math.random() * 900000);
  
      var res1 = await UserMeta.findOne({email,otp});

      if(res1 && (parseInt(res1.timestamp)+(900000 ))>Date.now()){
        res.json({msg:"Verified Successfullly",success:true})
      }
      res.status(401).json({msg:"Verification Failed",success:false})



    }catch(e){
        
        res.status(500).send(e);
    
    }
    
    }))
  



module.exports = contactRouter;
