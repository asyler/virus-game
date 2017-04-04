/**
 * Created by asyler on 03.04.17.
 */

module.exports = {
    'Resume Game Test': '' + function (client) {
        client
            .callFunction('resumeGame')
            .waitForState('GamesList', 3000)
            .callFunction('open_game', {
                data: {
                    id: 5
                }
            })
            .waitForState('GamePreview', 3000)

    }
};