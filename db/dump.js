/**
 * Created by asyler on 31.03.17.
 */
///<reference path='../tsDefinitions/node.d.ts'/>
var mysql = require('mysql');
var config = require('../server/config.json');
var mysqlDump = require('mysqldump');
mysqlDump({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database,
    tables: ['users', 'games', 'users_games', 'board_cells', 'pvp_statistics'],
    data: false,
    dest: 'db/sql/dump.sql',
}, function (err) {
    console.log(err);
    // create data.sql file;
});
