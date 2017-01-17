class GameS {
    id: string;
    players: Array<string> = [];
    max_players: number = 2;

    constructor(userid:string) {
        this.id = UUID();
        this.addPlayer(userid);
    }

    addPlayer(userid:string) {
        this.players.push(userid);
        clients[userid].emit('added to game', this.id);
        clients[userid].join('game_'+this.id);
    }

    isFilled() {
        return this.players.length==this.max_players;
    }

    start() {
        sio.to('game_'+this.id).emit('start game',this.players[0]);
    }
}