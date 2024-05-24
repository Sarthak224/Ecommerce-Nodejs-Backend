const mongoose = require('mongoose');

const userFeedbackSchema = new mongoose.Schema({
message:{type:String},
email:{type:String},
firstname:{type:String},
lastname:{type:String},
});

    

const UserFeedbacks = mongoose.model('usrfeedbacks', userFeedbackSchema);

module.exports = UserFeedbacks;
