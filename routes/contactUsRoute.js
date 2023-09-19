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

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "2littleclay@gmail.com",
    pass: "",
  },
});








contactRouter.post('/', expressAsyncHandler(async (req, res, next) => {

try{
   
    const info = await transporter.sendMail({
        from: '"Sarthak Madhwal" <smadhwal13@gmail.com>', // sender address
        to: "sarthakcreed68@gmail.com", // list of receivers
        subject: "Hello P✔", // Subject line
        text: "Hello world?", // plain text body
        html: "<b>Hello world?</b>", // html body
      });
    
      console.log("Message sent: %s", info.messageId);

}catch(e){
    
    res.status(500).send(e);

}

}))







module.exports = contactRouter;
