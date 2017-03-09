/**
 * Created by asyler on 14.08.16.
 */

module UIPlugin
{
    export class Button extends Phaser.Button {
        private base_path;
        private func;
        private context;
        private state;
        private paths;
        private funcs;
        private button_group;
        private outFrame;
        private disabled;
        constructor(game_: Phaser.Game, x: number, y: number, sprite: string, func, context, base_path, parent = false, button_group = false) {
            super(game_, x, y, sprite);
            if (parent === true)
                parent = context;
            if (parent)
                (<any>parent).add(this);

            this.smoothed = false;

            this.base_path = base_path;
            this.func = func;
            this.context = context;
            this.state = 0;
            this.paths = [this.base_path];
            this.funcs = [this.func];
            this.button_group = button_group;
            this.outFrame = 'normal';

            this.onInputUp.add(this.call, this);
            this.setFrames(base_path + 'hover', base_path + 'normal', base_path + 'click');

            this.input.useHandCursor = true;
            // this.onInputOver.add(function() {
            //     game.cursor.frame = 2;
            // }, this);
            //
            // this.onInputOut.add(function() {
            //     game.cursor.frame = 1;
            // }, this);
        }

        setClickedState(name) {
            this.onInputUp.add(function () {
                if (this.button_group) {
                    this.parent.setAll('outFrame', 'normal');
                }
                this.outFrame = name;
                if (this.button_group) {
                    this.parent.callAll('updateFrames');
                }
            }, this, 1);
        }

        setToggleState(sprite, func) {
            this.paths = [this.base_path, sprite];
            this.funcs = [this.func, func];
        }

        setDisabled(val) {
            if (val) {
                this.setFrames(this.base_path + 'inactive', this.base_path + 'inactive', this.base_path + 'inactive');
                this.disabled = true;
            } else {
                this.setFrames(this.base_path + 'hover', this.base_path + 'normal', this.base_path + 'click');
                this.disabled = false;
            }
        }

        call() {
            if (this.disabled)
                return;
            let state = this.state;
            this.state = (this.paths.length - 1) - this.state;
            if (this.paths.length > 1) {
                var base_path = this.paths[this.state];
                this.setFrames(base_path + 'hover', base_path + 'normal', base_path + 'click');
            }
            this.funcs[state].apply(this.context, [this]);
        }

        updateFrames() {
            if (this.outFrame != 'normal')
                this.setFrames(this.base_path + this.outFrame, this.base_path + this.outFrame, this.base_path + this.outFrame);
            else
                this.setFrames(this.base_path + 'hover', this.base_path + 'normal', this.base_path + 'click');
        }
    }
}