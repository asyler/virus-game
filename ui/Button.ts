/**
 * Created by asyler on 28.02.17.
 */

module UIPlugin {
    export class Button extends Phaser.Group {
        button:Phaser.Button;
        button_text:Phaser.Text;

        constructor(game: Phaser.Game, x:number, y:number, callback:() => any, scope, text:string, font) {
            super(game);
            this.button = game.add.button(x, y, 'ui', callback, scope, 'blue_button01', 'blue_button03', 'blue_button05');
            this.button.anchor.set(0.5, 0.5);

            this.button_text = game.add.text(0, 0, text, font);
            this.button_text.alignIn(this.button, Phaser.CENTER);
        }
    }
}