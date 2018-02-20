const jwt = require('jsonwebtoken');
const authConfig = require('../../config/auth.json');

module.exports = (req,res,next) =>{
    const authHeader = req.headers.authorization;

    if(!authHeader)
        return res.status(401).send({error:'No token provided!'});

    //Verificar o formado de token por jwt
    const pars = authHeader.split(' ');

    if(!pars.length === 2)
        return res.status(401).send({error:'Token error!'});

    var [scheme,token] = pars;
    //verificando de começa comn Bearer
    if(!/^Bearer$/i.test(scheme))
        return res.status(401).send({error:'Token malformateded!'});

    jwt.verify(token, authConfig.secret, (err, decoded) => {
        if(err) return res.status(401).send({error:'Token invalid!'});

        req.userId = decoded.id;
        return next();
    });

};