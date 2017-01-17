///<reference path='node.d.ts'/>

let express = require('express');
let app = express();
let http = require('http').Server(app);
let path = require('path');

app.get('/', function(req, res){
    res.sendFile(path.resolve(__dirname + '/../index.html'));
});

app.use(express.static(path.resolve(__dirname + '/../')));

http.listen(process.env.PORT || 3003, function(){
    console.log('listening on *:'+process.env.PORT);
});