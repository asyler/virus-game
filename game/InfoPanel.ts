module VirusGame {
    export class InfoPanel extends Phaser.Text {

        constructor(game: Phaser.Game, x: number, y: number) {
            super(game, x, y, null);
            this.anchor.set(0.5, 0);
        }

        setInfo(player: BoardPlayer, left_turns: number) {
            let str = R.strings['player_info'](left_turns, player.color);
            this.setText(str);
            this.setStyle({
                "fill": player.color,
                "font": "bold 30px Arial"
            });
        }

        gameOver(player: BoardPlayer) {
            let str = R.strings['game_over'](player.color);
            this.setText(str);
            this.setStyle({
                "fill": player.color,
                "font": "bold 30px Arial"
            });
        }
    }
}