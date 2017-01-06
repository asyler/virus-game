module VirusGame {
    export class BoardGame extends Phaser.State {

        number_of_players: number = 2;
        current_player: BoardPlayer;

        board: Phaser.Group;

        create() {
            this.drawBoard();
        }

        drawBoard() {
            this.board = this.add.group();
            this.board.x = this.world.centerX;
            this.board.y = this.world.centerY;

           for (let i=0; i<10; i++) {
                for (let j=0; j<10; j++) {
                    this.addCell(i,j);
                }
            }
        }

        addCell(x: number, y: number) {
            let cell = new BoardCell(this.game, x,y, this.board);
        }
    }
}