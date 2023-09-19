const express = require("express");
const app = express();
const productRoute = require('./routes/productRoute');
const mongoose = require('mongoose')
const cors = require('cors');
const paymentRoute = require('./routes/paymentRoute');
const dotenv = require('dotenv');
const ordersRouter = require("./routes/orderRoute");
const userRouter = require("./routes/userRoute");
const contactRouter = require('./routes/contactUsRoute')
dotenv.config();

var allowedOrigins = ['http://localhost:3000',
                      'http://192.168.29.141:3000'
                    ];



app.use(cors({
  origin: function(origin, callback){
    // allow requests with no origin 
    // (like mobile apps or curl requests)
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      var msg = 'The CORS policy for this site does not ' +
                'allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
  "preflightContinue": false,
  "optionsSuccessStatus": 204,
  
}))

mongoose.connect(process.env.URL_DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  family: 4,
}).then(()=>{console.log("Successful")}).catch((err)=>{console.log(err)});

//app.use(cors());
app.use(express.json());
app.use('/products',productRoute);
app.use('/api/payment',paymentRoute)
app.use('/api/orders',ordersRouter)
app.use('/api/users',userRouter)
app.use('/api/contact-us',contactRouter)



app.use((err, req, res, next) =>{
  console.error("err.stack")
  res.status(500).send({data:{message:err.message}})
})

app.listen(3011,()=>{
  console.log('Running at 3011');
})
