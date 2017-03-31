/**
 * Created by asyler on 31.03.17.
 */

///<reference path='../tsDefinitions/node.d.ts'/>

let mysql = require('mysql');
let config = require('../server/config.json');
let connection = mysql.createConnection({
    host     : config.host,
    user     : config.user,
    password : config.password,
    database : config.database
});
connection.connect();

connection.query('DROP DATABASE ?', [config.database]);
