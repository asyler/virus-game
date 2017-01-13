module VirusGame {
    export class BoardGame extends Phaser.State {

        number_of_players: number = 2;
        current_player_number: number;
        left_turn_cells: number;

        board: Phaser.Group;
        players: Array<BoardPlayer>;
        info: InfoPanel;

        colors: Array<string> = ['blue','yellow'];

        create() {
            this.addPlayers();
            this.initGame();
            this.drawBoard();
            this.drawInfo();
        }

        private drawInfo() {
            this.info = this.add.existing(new InfoPanel(this.game,this.world.centerX,10));
            this.info.setInfo(this.current_player,this.left_turn_cells);
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
            this.left_turn_cells = 1;
            this.current_player.is_first_turn = false;
        }

        
        get current_player() {
            return this.players[this.current_player_number];
        }

        get current_player_color():string {
            return this.players[this.current_player_number].color;
        }

        endTurn() {
            this.left_turn_cells--;
            this.checkTurnChange();

            this.info.setInfo(this.current_player,this.left_turn_cells);
        }

        private checkTurnChange() {
            if(this.left_turn_cells == 0) {
                this.current_player_number = (this.current_player_number+1)%this.number_of_players;

                if (this.current_player.is_first_turn == true) {
                    this.left_turn_cells = 1;
                    this.current_player.is_first_turn = false;
                } else {
                    this.left_turn_cells = 3;
                }
            }
        }
    }
}