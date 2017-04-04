/**
 * Created by asyler on 03.04.17.
 */

CreateGame = {
    "Create Game Test" : function(client) {

        client
            .callFunction('createGame')
            .waitForState('CreateGame', 3000)
    }
};