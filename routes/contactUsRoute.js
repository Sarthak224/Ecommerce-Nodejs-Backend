const express = require('express');
const Admins = require('../models/Admins')
const mongoose = require('mongoose')
const multer  = require('multer')
const {verifyDomain, generateAccessToken, authenticateToken} = require('../utils')
var contactRouter = express.Router();
const expressAsyncHandler = require('express-async-handler');


//Create img path






const nodemailer = require("nodemailer");
const UserMeta = require('../models/UserMeta');
const UserSession = require('../models/UserSession');
const UserFeedbacks = require('../models/UserFeedback');













const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "smadhwal13@gmail.com",//"2littleclay@gmail.com",
    pass: "mghn fgye oghk folw",
  },
});








// contactRouter.post('/', expressAsyncHandler(async (req, res, next) => {

// try{
   
//   var {email,title,msg} = req.body;
   
//     const info = await transporter.sendMail({
//         from: '"Sarthak Madhwal" <smadhwal13@gmail.com>', // sender address
//         to: "sarthakcreed68@gmail.com", // list of receivers
//         subject: "Hello P✔", // Subject line
//         text: "Hello world?", // plain text body
//         html: "<b>Hello world?</b>", // html body
//       });
    
//       console.log("Message sent: %s", info.messageId);
//       res.send({msg:"Message Sent",success:true})
// }catch(e){
    
//     res.sendStatus(500).send(e);

// }

// }))

contactRouter.post('/', expressAsyncHandler(async (req, res, next) => {

  try{
     var {message,firstname,lastname,email} = req.body;
     if(!message || !firstname || !lastname || !email){
        res.status(500).send({"message":"Please fill all the necessary fields"})
        return;
    }

     const resp = await UserFeedbacks.create({message,firstname,lastname,email});
     res.status(201).send(resp)

     
  }catch(e){
      
      res.status(500).send(e);
  
  }
  
  }))



  contactRouter.get('/',authenticateToken, expressAsyncHandler(async (req, res, next) => {

    try{
      //  var {message,firstname,lastname,email} = req.body;
      //  if(!message || !firstname || !lastname || !email){
      //     res.status(500).send({"message":"Please fill all the necessary fields"})
      //     return;
      // }
  
       const resp = await UserFeedbacks.find({}).sort({_id:-1});
       console.log(resp)
       res.status(200).send(resp)
  
       
    }catch(e){
        
        res.status(500).send(e);
    
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
        const token = generateAccessToken({email},'30d');
        res1 = await UserSession.deleteMany({email});
        res1 = await UserSession.create({token,email});

        res.json({msg:"Verified Successfullly",success:true,token})
      }

      res.status(401).json({msg:"Verification Failed",success:false})



    }catch(e){
        
        res.status(500).send(e);
    
    }
    
    }))
  


    contactRouter.post('/verifyEmailToken',authenticateToken, expressAsyncHandler(async (req, res, next) => {

      try{
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]
        var session = UserSession.findOne({token});

       
        res.json({msg:"Already Logged n user",email:session.email})
         
      
      }catch(e){
          
          res.status(500).send(e);
      
      }
      
      }))


module.exports = contactRouter;
