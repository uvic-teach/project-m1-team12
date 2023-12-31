const mongoose = require('mongoose');

const User = new mongoose.Schema({
    name: {type: String, Required: true, unique: true}, 
    email: {type: String, Required: true, unique: true}, 
    password: {type: String, Required: true}, 
    usertype: {type: String}
}, {collection: 'user-data'})

const model = mongoose.model('UserData', User)
module.exports = model;

