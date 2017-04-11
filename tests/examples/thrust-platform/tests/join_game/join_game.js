/**
 * Created by asyler on 03.04.17.
 */

module.exports = {
    'Join Game Test': '' + function (client) {
        client
            .callFunction('joinGame')
            .waitForState('GamesList', 3000)
            .callFunction('open_game', {
                data: {
                    id: 5
                }
            })
            .waitForState('GamePreview', 3000)

    }
}