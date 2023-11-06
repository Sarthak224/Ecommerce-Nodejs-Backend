const mongoose = require('mongoose');

const UserSessionSchema = new mongoose.Schema({
token:{type:String},
email:{type:String},


});

    

const UserSession = mongoose.model('UserSession', UserSessionSchema);

module.exports = UserSession;
