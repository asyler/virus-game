module VirusGame {
    export class BoardGame extends Phaser.State {

        number_of_players: number = 2;
        current_player_number: number;
        left_turn_cells: number;

        board: Phaser.Group;
        players: Array<BoardPlayer>;

        colors: Array<string> = ['blue','yellow'];

        create() {
            this.drawBoard();
            this.addPlayers();
            this.initGame();
        }

        private drawBoard() {
           this.board = this.add.group();

           for (let i=0; i<10; i++) {
                for (let j=0; j<10; j++) {
                    this.addCell(i,j);
                }
            }
            this.board.align(10,10,38,36);
            this.board.alignIn(this.world.bounds,Phaser.CENTER);
        }

        private addCell(x: number, y: number) {
            let cell = new BoardCell(this.game, x,y, this);
        }

        private addPlayers() {
            this.players = [];
            for (let i=0; i<this.number_of_players; i++) {
                this.players.push(new BoardPlayer(this.colors[i]));
            }
        }

        private initGame() {
            this.current_player_number = 0;
            this.left_turn_cells = 3;
        }

        get current_player_color():string {
            return this.players[this.current_player_number].color;
        }

        endTurn() {
            this.current_player_number = (this.current_player_number+1)%this.number_of_players;
        }
    }
}