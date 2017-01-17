class GameServer {

    waiting_games: Array<GameS> = [];
    playing_games: {[id: string]: GameS} = {};

    constructor() {

    }

    onMessage(client,message) {
        this[message].apply(this, [client.userid]);
    }

    findGame(userid: string) {
        if (this.waiting_games.length>0) {
            // there is already hosted games
            let game = this.waiting_games[0];
            game.addPlayer(userid);
            if (game.isFilled()) {
                // start game
                this.playing_games[game.id] = this.waiting_games.shift();game
                game.start();
            }
        } else {
            // create new game
            let game = new GameS(userid);
            this.waiting_games.push(game);
        }
    }

    onPlayerMove(userid:string, gameid:string, row:number, col:number) {
        sio.to('game_'+gameid).emit('player move',userid,gameid,row,col);
    }
}