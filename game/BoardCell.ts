module VirusGame {
    const enum CellState { Empty, Alive, Dead };

    export class BoardCell {
        x: number;
        y: number;
        state: CellState = CellState.Empty;
        player: BoardPlayer;
        image: Phaser.Image;

        constructor(game: Phaser.Game, x: number, y: number, board_game: BoardGame) {
            let image = game.add.image(0, 0, 'board_cells', 'grey_box', board_game.board);
            this.image = image;

            image.inputEnabled = true;
            image.input.useHandCursor = true;
            image.events.onInputOver.add(function () {
                image.tint = 0xaaaaaa;
            });
            image.events.onInputOut.add(function () {
                image.tint = 0xffffff;
            });
            image.events.onInputUp.add(function () {
                if (board_game.isTurnLegal(x, y)) {
                    switch (this.state) {
                        case CellState.Empty:
                            this.image.frameName = board_game.current_player_color + '_boxCross';
                            this.state = CellState.Alive;
                            board_game.endTurn();
                            break;
                        case CellState.Alive:
                            this.image.frameName = board_game.current_player_color + '_boxCheckmark';
                            this.state = CellState.Dead;
                            board_game.endTurn();
                            break;
                        case CellState.Dead:

                            break;
                    }
                }
            }, this);
        }
    }
} 