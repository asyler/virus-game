module VirusGame {
    export class BoardGame extends Phaser.State {

        number_of_players: number = 2;
        current_player_number: number;
        left_turn_cells: number;

        board: Phaser.Group;
        players: Array<BoardPlayer>;
        info: Phaser.Text;

        colors: Array<string> = ['blue','yellow'];

        create() {
            this.addPlayers();
            this.initGame();
            this.drawBoard();
            this.drawInfo();
        }

        private drawInfo() {
            this.info = this.add.text(this.world.centerX,10,null,null);
            this.info.anchor.set(0.5,0);
            this.setInfo();
        }

        private setInfo() {
            let str = "Turn of " + this.current_player_color + " player";
            this.info.setText(str);
            this.info.setStyle({
                "fill":this.current_player_color,
                "font":"bold 40px Arial"
            });
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
            this.setInfo();
        }
    }
}