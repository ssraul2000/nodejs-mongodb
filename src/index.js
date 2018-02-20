const express = require('express');
const bodyParser = require('body-parser');

const app =express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded( {extended:false} ));

app.get('/', (rep,res)=> {
    res.send("hdfksajefh");
});

require('./app/controlls/index')(app);

var port = process.env.port || 3000;

app.listen(port);
