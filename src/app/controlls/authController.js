const express = require('express');
const User = require('../models/User');
const  bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authConfig = require('../../config/auth.json');
const crypto = require('crypto');

const mailer = require('../../modules/mailer');




const router = express.Router();

//Função para gerar o Token
function generateToken(params = {}){
    return jwt.sign(params,authConfig.secret, {expiresIn:86400});
}



//Criando umas router para registrar o usuário
router.post('/register', async (req,res)=>{
    const {email} = req.body;

    try{
        //Verificando se esse email já foi cadastrado
        if(await User.findOne({email})){
            return res.status(400).send({error:'User already exits!'});
        }

        const user = await User.create(req.body);
        //Tirando o psssword do return do user
        user.password = undefined;
        return res.send({
            user,
            token:generateToken({id:user.id}),
    });

    }catch(err){
        return res.status(400).send({error:'Registration Failed!'});
    }
});
//Criando router para authenticar o user

router.post('/authenticate', async (req,res)=>{
    const {email,password} = req.body;
    const user = await User.findOne({email}).select('+password');

    //Verificando se esse user exciste
    if(!user){
        res.status(400).send({error:'User not found!'});
    };
    //Veirificando se essa senha compara com a passada pela req
    if(!await bcrypt.compare(password,user.password)){
        res.status(400).send({error:'Invalid password!'});
    };

    res.send({
        user,
        token:generateToken({id:user.id}),
    });

});

//Criando a router de esqueci minha senha
router.post('/forgot_password', async (req,res) =>{
    const {email} = req.body;
    try{
        const user = await User.findOne({email});

        if(!user){
            return res.status(400).send({error:'User not found!'});
        };
        const token = crypto.randomBytes(20).toString('hex');
        const now = new Date();
        now.setHours(now.getHours() +1 );

        await User.findOneAndUpdate(user.id, {
            '$set':{
                passwordResetToken: token,
                passwordResetExpires: now
            }
        });
        

        mailer.sendMail({
            to:email,
            from: 'raulsilva.eeepeq@gmail.com.br',
            template:'auth/forgot_password' ,
            context: {token},
        }, (err)=>{
            if(err)  return res.status(400).send({error:'Cannot send forgot password email'});
            return res.send();
        }  );


    }catch(err){
        res.status(400).send({error:'Forgot on password, try again!'});
    }

   


});

 //Router para resetar a senha no banco de dados
 router.post('/reset_password', async (req,res) =>{
    try{
    const {email,token,password} = req.body;
    const user = await User.findOne({email}).select('+passwordResetToken passwordResetExpires');
    
    if(!user)
        return res.status(400).send({error: 'User not found'});
    
    if(token != user.passwordResetToken)
        return res.status(400).send({error:'Token invalided!'});

    const now =  new Date();
    if(now > user.passwordResetExpires )
        return res.status(400).send({error: 'Token expired, generade new one!'});
    user.password = password;
    await user.save();
    res.send();
 
    }catch(err){
        return res.status(400).send({error: 'Cannot reset password, try again'});
    }
});  

module.exports = app => app.use('/auth', router);

