const express = require('express');
const path = require('path')
const ProductModel = require('../models/Product');
const ProductView = require('../models/ProductView')
const mongoose = require('mongoose')
const multer  = require('multer')
const {verifyDomain} = require('../utils')

var productRouter = express.Router();


//Create img path
var imgPath=__dirname,remInd = imgPath-1;

for(var i=imgPath.length-1;i>=0;--i){

  if(imgPath.charAt(i)=='\\'){
    remInd = i;
    break;
  }
}


imgPath = imgPath.substring(0,remInd) + '\\Images';


productRouter.use('/Images',express.static(imgPath))

const expressAsyncHandler = require('express-async-handler');


productRouter.post('/', expressAsyncHandler(async (req, res, next) => {
  verifyDomain(req,res)

  try{
  //Pagination logic
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
 
  //Adding filters to obj (if any) 
  var filterObject = {}
  var filters = req.body.filters;
  var QueryMain = {};
  // if()
  if(filters && filters.price_range)
  QueryMain = { $or: filters.price_range.map(val=>{
    return {price: {$gte: parseFloat(val.min), $lte: parseFloat(val.max)}}
  }) };
  // console.log(filters.price_range);
  //   console.log(QueryMain);







  if(req.query.category)
  filterObject["category"] = req.query.category;
  //var discount = req.query.discount;
  var data=[];
  if(filters){
   if(filters.sort)
   data = await ProductModel.find(QueryMain).sort({price:filters.sort}).skip(skip).limit(limit);
  else{
   data = await ProductModel.find(QueryMain).skip(skip).limit(limit);
   console.log(JSON.stringify(QueryMain))
  }
  }else{
    data = await ProductModel.find({}).skip(skip).limit(limit);

  } 

  res.json(data);
}catch(e){
  res.status(500).send(e);
}

}))


productRouter.get('/totalProducts',expressAsyncHandler(async(req,res,next)=>{
  
 try{
  var count = await ProductModel.count({});
  res.json({data:count})
 }catch(e){
  res.sendStatus(500).json(e)
 }
 
}))

productRouter.get('/productFilters', expressAsyncHandler(async (req, res, next) => {

  try{
  var allData = await ProductModel.find({});
  var category = {};
   
  for(var i=0;i<allData.length;++i){
    category[""+allData[i].category] = 1;
  }

  category = Object.keys(category);
  res.json({category});
}catch(e){
  res.status(500).send(e);
}
}))



productRouter.get('/productDetails', expressAsyncHandler(async (req, res, next) => {
  verifyDomain(req,res)

    try{
    var _id = req.query.product_id;
     
    var productData = await ProductView.findById({_id});
    console.log(productData)
    res.json(productData);
    }catch(e){
      res.status(500).send(e);
    }
}));


productRouter.post('/getCartProducts', expressAsyncHandler(async (req, res, next) => {

  try{
  var p_id = req.body.product_id_list;
  
  var id_list = [];
  for(var i=0;i<p_id.length;++i){
    id_list.push(new mongoose.Types.ObjectId(''+p_id[i]));
  }

  var data = await ProductView.find({
    '_id': { $in: [
       ...id_list
    ]}
  });
  console.log(data);
  res.send(data)
  }catch(e){
    res.status(500).send(e.message);
  }
}));


productRouter.get('/allProducts', expressAsyncHandler(async (req, res, next) => {

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
  var productData = await ProductView.find({}).skip(skip).limit(limit);;
  res.json(productData);
  }catch(e){
    res.status(500).send(e);
  }
}));




const fileFilter = (req,file,cb) => {
  console.log(file)
  if (file.fieldname === "image") {
      (file.mimetype === 'image/jpeg' 
       || file.mimetype === 'image/png')
      ? cb(null,true)
      : cb(null,false);
  }
  else if(file.fieldname === "document"){
      (file.mimetype === 'application/msword' 
      || file.mimetype === 'application/pdf')
      ? cb(null,true)
      : cb(null,false);
  }
}





var imgUrl;
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './Images')
  },
  filename: function (req, file, cb) {
    console.log(file.filename)
    const uniqueSuffix = Date.now() + '-' + file.originalname;
    imgUrl = uniqueSuffix;
    cb(null, uniqueSuffix)
  }
})
const upload = multer({ storage: storage,
  /* limits: { fileSize: 1 * 1024 * 1024*50 }, // 50MB
fileFilter: fileFilter,*/
})
// .fields(
//   [
//     { 
//       name: 'productImage', 
//       maxCount: 4 
//     }, 
   
//   ]
// )

// const cpUpload = upload.fields([{ name: 'productImage', maxCount: 4 }])


productRouter.post('/updateProductImage',  upload.array("productImage"),expressAsyncHandler(async(req,res,next)=>{

  console.log(":");

  console.log(req.files);
  var resp =  await ProductView.findByIdAndUpdate({_id:req.body.p_id},{

    image: req.files.map(val=>(process.env.HOSTURL+"/products/Images/"+val.filename))
  
  })

  var detail_id = req.body.p_id;
    var productMetaUpdateRes = await ProductModel.findOneAndUpdate({detail_id},{
      image:process.env.HOSTURL+"/products/Images/"+req.files[0].filename
    },{
    new:true
  })
  res.send(productMetaUpdateRes)

}))


productRouter.post('/updateProduct',expressAsyncHandler(async (req, res, next) => {

  try{
    // var page = (req.query.page);
    // var skip = 0;
    // var limit = 20;
    // if(page){
    // page = parseInt(req.query.page);
    // if(page>1){
  
    //   skip = (page-1) * limit;
    // }
    // }
    // else
    // page = 1;
  var productUpdateRes = await ProductView.findByIdAndUpdate({_id:req.body.id},req.body.productData,{
    new:true
  })//.skip(skip).limit(limit);;
  // var productMetaUpdateRes = await ProductModel.findById({detail_id:req.body.id},req.body.productData,{
  //   new:true
  // })
  // console.log(productMetaUpdateRes)
    var detail_id = req.body.id
    var productMetaUpdateRes = await ProductModel.findOneAndUpdate({detail_id},req.body.productData,{
    new:true
  })
  console.log(productMetaUpdateRes)

  res.json(productUpdateRes);

  }catch(e){
    console.log(e)
    res.status(500).send(e);
  }
}));

productRouter.post('/createProduct',expressAsyncHandler(async (req, res, next) => {

  try{
    // var page = (req.query.page);
    // var skip = 0;

  var productUpdateRes = await ProductView.create({...req.body,rating:{rate:0,count:0}})//.skip(skip).limit(limit);;
  
  productUpdateRes = productUpdateRes.toJSON();
  var productMetaUpdateRes = await ProductModel.create({...req.body,detail_id:productUpdateRes._id})
  console.log(productMetaUpdateRes)

  res.json(productUpdateRes);

  }catch(e){
    console.log(e)
    res.status(500).send(e);
  }
}));





productRouter.post('/deleteProduct',expressAsyncHandler(async (req, res, next) => {

  try{
    // var page = (req.query.page);
    // var skip = 0;

  var productUpdateRes = await ProductView.findByIdAndDelete({_id:req.body.id})//.skip(skip).limit(limit);;
  
  productUpdateRes = productUpdateRes.toJSON();
  var productMetaUpdateRes = await ProductModel.findOneAndDelete({detail_id:req.body.id})
  console.log(productMetaUpdateRes)

  res.json({msg:"Deleted Successfully"});

  }catch(e){
    console.log(e)
    res.status(500).send(e);
  }
}));



productRouter.get('/latestProducts',expressAsyncHandler(async (req, res, next) => {

  try{
    // var page = (req.query.page);
    // var skip = 0;

  var productCount  = await ProductModel.count();
  var latestProducts = await ProductModel.find({}).skip(productCount-10);
  res.json({latestProducts});

  }catch(e){
    console.log(e)
    res.status(500).send(e);
  }
}));


module.exports = productRouter;
