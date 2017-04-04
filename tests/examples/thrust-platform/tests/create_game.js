extend = function(target) {
    var sources = [].slice.call(arguments, 1);
    sources.forEach(function (source) {
        for (var prop in source) {
            target[prop] = source[prop];
        }
    });
    return target;
}

require("./login/login.js");
module.exports = extend(module.exports,Login);

require("./create_game/create_game.js");
module.exports = extend(module.exports,CreateGame);