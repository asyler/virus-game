module VirusGame {
    export const enum CellState { Empty, Alive, Dead };

    export class BoardCell extends Phaser.Image {

        state: CellState = CellState.Empty;
        player: BoardPlayer;

        isPossibleToMoveTo: boolean = false;

        constructor(public row: number, public col: number, public board_game: BoardGame) {
            super(board_game.game, 0, 0, 'board_cells', 'grey_box');

            this.inputEnabled = true;
            this.input.useHandCursor = true;
            this.events.onInputOver.add(this.drawUnderPointer, this);
            this.events.onInputOut.add(this.drawNormal, this);
            this.events.onInputUp.add(function() {
                if (this.board_game.current_player.is_local_player)
                    this.cellPlayed();
            }, this);
        }

        cellPlayed() {
            if (this.board_game.isTurnLegal(this.row, this.col)) {
                switch (this.state) {
                    case CellState.Empty:
                        client.player_move(this.row,this.col);
                        this.frameName = this.board_game.current_player_color + '_boxCross';
                        this.state = CellState.Alive;
                        this.player = this.board_game.current_player;
                        this.board_game.endTurn();
                        break;
                    case CellState.Alive:
                        client.player_move(this.row,this.col);
                        this.frameName = this.board_game.current_player_color + '_boxCheckmark';
                        this.state = CellState.Dead;
                        this.player = this.board_game.current_player;
                        this.board_game.endTurn();
                        break;
                    case CellState.Dead:
                        break;
                }
            }
        }

        drawNormal() {
            if(this.isPossibleToMoveTo)
                this.tint = 0xabcdef;
            else
                this.tint = 0xffffff;
        }
        drawUnderPointer() {
            this.tint = 0xaaaaaa;
        }

        makePossibleToMoveTo() {
            this.isPossibleToMoveTo = true;
            this.drawNormal();
        }
        disablePossibleToMoveTo() {
            this.isPossibleToMoveTo = false;
            this.drawNormal();
        }
    }
} 