const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
code:{type:String},
products:{type:Array},
coupon_type:{type:String},
coupon_value:{type:Number},
valid_till:{type:String},
max_spend:{type:Number},
min_spend:{type:Number},
usage_limit_per_user:{type:Number},


});

    

const Coupon = mongoose.model('Coupons', couponSchema);

module.exports = Coupon;
