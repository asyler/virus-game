module VirusGame {
    export const enum CellState { Empty, Alive, Dead };

    export class BoardCell extends Phaser.Image {

        state: CellState = CellState.Empty;
        player: BoardPlayer;

        constructor(public row: number, public col: number, board_game: BoardGame) {
            super(board_game.game, 0, 0, 'board_cells', 'grey_box');

            this.inputEnabled = true;
            this.input.useHandCursor = true;
            this.events.onInputOver.add(function () {
                (<BoardCell>this).tint = 0xaaaaaa;
            }, this);
            this.events.onInputOut.add(function () {
                (<BoardCell>this).tint = 0xffffff;
            }, this);
            this.events.onInputUp.add(function () {
                if (board_game.isTurnLegal(row, col)) {
                    switch (this.state) {
                        case CellState.Empty:
                            this.frameName = board_game.current_player_color + '_boxCross';
                            this.state = CellState.Alive;
                            this.player = board_game.current_player;
                            board_game.endTurn();
                            break;
                        case CellState.Alive:
                            this.frameName = board_game.current_player_color + '_boxCheckmark';
                            this.state = CellState.Dead;
                            this.player = board_game.current_player;
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