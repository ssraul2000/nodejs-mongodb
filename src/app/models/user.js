const mongoose = require('../../database');
const bcrypt = require('bcryptjs');

const userSchema =  new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        lowercase:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
        select:false,
    },
    passwordResetToken:{
        type:String,
        select:false,
    },
    passwordResetExpires:{
        type:Date,
        select:false,
    },
    createAt:{
        type:Date,
        default:Date.now,
    },
});

//Criptografar a senha
userSchema.pre('save', async function(next) {
    var hast = await bcrypt.hash(this.password,10);
    this.password = hast;
    next();
});


//Defininfo o model
const User = mongoose.model('User', userSchema);
module.exports= User;
