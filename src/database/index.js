const mongoose =require('mongoose');

mongoose.connect('mongodb://localhost/apiu-rest',{useMongoClient:true});
mongoose.Promise = global.Promise;


module.exports = mongoose;
