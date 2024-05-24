const express = require("express");
const app = express();
const productRoute = require('./routes/productRoute');
const mongoose = require('mongoose')
const cors = require('cors');
const paymentRoute = require('./routes/paymentRoute');
const dotenv = require('dotenv');
const ordersRouter = require("./routes/orderRoute");
const userRouter = require("./routes/userRoute");
const contactRouter = require('./routes/contactUsRoute');
const cartRouter = require("./routes/cart");

const phonePe = require("./routes/paytmPaymentRoute");

dotenv.config();

var allowedOrigins = ['http://localhost:3001',
                      'http://192.168.29.141:3000'
                    ];



app.use(cors())

mongoose.connect("mongodb://localhost:27017/ecommerce-db", {
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
app.use('/api/cart',cartRouter)
app.use('/api/payment2',phonePe)



app.use((err, req, res, next) =>{
  console.error("err.stack")
  console.log(err.message)
  res.status(500).send({data:{message:err.message}})
})

app.listen(3011,()=>{
  console.log('Running at 3011');
})
