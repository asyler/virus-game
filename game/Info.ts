module VirusGame {
    export class Info extends Phaser.Text {

        constructor(game: Phaser.Game, x:number, y:number) {
            super(game,x,y,null);
            this.anchor.set(0.5,0);
        }

        setInfo(player: BoardPlayer, left_turns: number) {
            let str = left_turns + " cells more for " + player.color.toString() + " player";
            this.setText(str);
            this.setStyle({
                "fill":player.color,
                "font":"bold 30px Arial"
            });
        }
    }
}