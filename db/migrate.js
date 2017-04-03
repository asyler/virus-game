/**
 * Created by asyler on 31.03.17.
 */
///<reference path='../tsDefinitions/node.d.ts'/>
var mysql = require('mysql');
var config = require('../server/config.json');
var exec = require('child_process').exec;
var seed = require('../db/seed.json');
var bcrypt = require('bcrypt');
var db_config = {
    host: config.host,
    user: config.user,
    password: config.password,
};
var connection = mysql.createConnection(db_config);
connection.connect();
var done;
// drop old db
connection.query('DROP DATABASE IF EXISTS ' + config.database, function () {
    // create new one
    connection.query('CREATE DATABASE ' + config.database, function () {
        // restore dump
        var tables = ['dump'];
        done = tables.length;
        tables.forEach(function (table, i) {
            exec("mysql -h " + config.host + " -u " + config.user + " -D " + config.database + " -p" + config.password + " < " + "db/sql/" + table + ".sql", function () {
                done--;
                if (done == 0)
                    do_seed();
            });
        });
    });
});
function do_seed() {
    connection.query('use ' + config.database, function () {
        // seed users
        done = seed.length;
        seed.forEach(function (user, i) {
            bcrypt.genSalt(10, function (err, salt) {
                bcrypt.hash(user.password, salt, function (err, hash) {
                    connection.query('INSERT INTO users (username, password) VALUES (?, ?);', [user.login, hash], function (err) {
                        // console.log(i);
                        if (err)
                            console.log(err);
                        done--;
                        if (done == 0)
                            connection.destroy();
                    });
                });
            });
        });
    });
}
