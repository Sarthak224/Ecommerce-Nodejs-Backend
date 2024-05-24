const mongoose = require('mongoose');

const UserMetaSchema = new mongoose.Schema({
otp:{type:String},
email:{type:String},
timestamp:{type:String}


});

    

const UserMeta = mongoose.model('UserMeta', UserMetaSchema);

module.exports = UserMeta;
