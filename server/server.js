///<reference path='node.d.ts'/>
var express = require('express');
var app = express();
var http = require('http').Server(app);
var path = require('path');
app.get('/', function (req, res) {
    res.sendFile(path.resolve(__dirname + '/../index.html'));
});
app.use(express.static(path.resolve(__dirname + '/../')));
http.listen(process.env.PORT || 3003, function () {
    console.log('listening on *:' + process.env.PORT);
});
