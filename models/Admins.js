const mongoose = require('mongoose');

const adminUsersSchema = new mongoose.Schema({
username:{type:String},
email:{type:String},
password:{type:String},

});

    

const Admins = mongoose.model('Admins', adminUsersSchema);

module.exports = Admins;
