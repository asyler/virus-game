/**
 * Created by asyler on 28.02.17.
 */

module UIPlugin {
    export class TextButton extends Phaser.Group {
        button:Phaser.Button;
        button_text:Phaser.Text;

        constructor(game_: Phaser.Game, x:number, y:number, callback:(b?) => any, scope, text:string, font, parent?, frames?) {
            super(game_,parent);
            frames = frames ? frames : ['blue_button01', 'blue_button03', 'blue_button05', 'blue_button01'];
            this.button = _game.add.button(x, y, 'ui', callback, scope, frames[0], frames[1], frames[2], frames[3], this);
            this.button_text = _game.add.text(0, 0, text, font, this);
            this.button_text.alignIn(this.button, Phaser.CENTER);
        }
    }
}