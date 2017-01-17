///<reference path='node.d.ts'/>
var app = require('express')();
var http = require('http').Server(app);
app.get('/', function (req, res) {
    res.send('<h1>Hello world</h1>');
});
http.listen(process.env.PORT || 3003, function () {
    console.log('listening on *:' + process.env.PORT);
});
