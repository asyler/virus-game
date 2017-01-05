module VirusGame {
    const enum CellState { Empty, Alive, Dead };

    export class BoardCell {
        x: number;
        y: number;
        state: CellState = CellState.Empty;
        player: BoardPlayer;
        image: Phaser.Image;

        constructor(game: Phaser.Game, x: number, y: number, board: Phaser.Group) {
            this.image = game.add.image(x*38,y*36,'board_cells','grey_box',board);
        }
    }
} 