/**
 * Created by asyler on 21.11.16.
 */

module UIPlugin {
    export class Slider extends Phaser.Image {
        min_y: number;
        max_y: number;
        max_abs_y: number;

        constructor(game:Phaser.Game, x:number, y:number, key:string|Phaser.RenderTexture|Phaser.BitmapData|PIXI.Texture, frame:string|number) {
            super(game, x, y, key, frame);
        }


    }

    export class SliderLayout extends Phaser.Group {
        private bg: Phaser.Image;
        private grid_cell: Phaser.Rectangle;
        private items_group: DataGroup;
        private _slider: Slider;
        private scroll_tween: Phaser.Tween;
        private scroll_slider_tween: Phaser.Tween;

        constructor(private config: any) {
            super(_game);
            this.config = config;

            this.config.container.add(this);
            this.x = config.position[0];
            this.y = config.position[1];

            this.init_ui();
            this.init_events();
        }

        init_ui() {
            let config = this.config;
            let self = this;

            let bg = typeof(config.bg) == typeof('') ? _game.add.image(0, 0, config.parent.sprite, config.bg, this) : config.bg;

            let items_group = objectFactory.data_group(this);
            let grid_cell = new Phaser.Rectangle(0, 0, config.item_size[0], config.item_size[1]);

            this.bg = bg;
            this.grid_cell = grid_cell;
            this.items_group = items_group;

            let mask = _game.add.graphics(
                config.container.cameraOffset.x + config.position[0],
                config.container.cameraOffset.y + config.position[1]);
            mask.fixedToCamera = true;
            mask.drawRect(config.items_offset[0], config.items_offset[1],
                bg.width - 2 * config.items_offset[0], bg.height - 2 * config.items_offset[1]);
            items_group.mask = mask;


            // slider
            let slider = _game.add.group(this);
            slider.x = config.slider_position[0];
            slider.y = config.slider_position[1];
            let slider_bg = _game.add.image(0, 0, config.parent.sprite, 'elements/scrolling/way', slider);
            let b_up = objectFactory.button(0, 0, config.parent.sprite, this.slide_down, this, 'elements/scrolling/arrow/up_', slider);
            let b_down = objectFactory.button(0, bg.height - b_up.height, config.parent.sprite, this.slide_up, this, 'elements/scrolling/arrow/down_', slider);
            slider_bg.crop(new Phaser.Rectangle(0, 0, slider_bg.width, bg.height - b_up.height));
            slider_bg.alignTo(b_up, Phaser.BOTTOM_CENTER, 0, -b_up.height / 2 | 0);
            let _slider = objectFactory.slider(0, 0, config.parent.sprite, 'elements/scrolling/scrolling/normal', slider);
            _slider.inputEnabled = true;
            _slider.input.enableDrag();
            _slider.min_y = b_up.y + b_up.height;
            _slider.max_y = b_down.y - (b_up.y + b_up.height);
            _slider.max_abs_y = _slider.max_y - _slider.height;
            _slider.input.boundsRect = new Phaser.Rectangle(b_up.width / 2 - _slider.width / 2 | 0, _slider.min_y, _slider.width, _slider.max_y);
            _slider.x = b_up.width / 2 - _slider.width / 2 | 0;
            _slider.y = _slider.min_y;
            _slider.input.useHandCursor = true;
            _slider.events.onInputOver.add(function () {
                // game.cursor.frame = 2;
                _slider.frameName = 'elements/scrolling/scrolling/hover';
            }, this);
            _slider.events.onInputOut.add(function () {
                // game.cursor.frame = 1;
                _slider.frameName = 'elements/scrolling/scrolling/normal';
            }, this);
            _slider.events.onInputDown.add(function () {
                _slider.frameName = 'elements/scrolling/scrolling/click';
            }, this);
            _slider.events.onInputUp.add(function () {
                _slider.frameName = 'elements/scrolling/scrolling/hover';
            }, this);
            _slider.events.onDragUpdate.add(function (img) {
                let pos = (img.y - img.min_y) / img.max_abs_y;
                self.layout_move(pos);
            });
            this._slider = _slider;

            if (config.data)
                this.update_items(config.data);
        }

        update_items(data: any[]) {
            let items_group = this.items_group;
            let config = this.config;
            let self = this;
            items_group.removeAll(true);

            let item_group;
            for (let item_data of data) {
                item_group = objectFactory.data_group(items_group);
            };
            items_group.align(config.cols, -1, config.item_size[0], config.item_size[1]);
            items_group.y = config.items_offset[1];
            items_group.x = (this.bg.width - config.item_size[0] * config.cols) / 2 + config.items_offset[0] | 0;

            data.forEach((item_data, i) => {
                let item_group = <DataGroup> items_group.getAt(i);
                item_group.data = item_data;
                config.show_item.apply(config.parent, [item_group, item_data, self.grid_cell, i]);
            });
            for (let i in data) {

            };
            this._slider.y = this._slider.min_y;
        }

        layout_move(pos) {
            if (this.scroll_tween) {
                this.scroll_tween.stop();
                this.scroll_slider_tween.stop();
            }
            let dbottom = (this.items_group.y + this.items_group.height) - (this.bg.height - 2 * this.config.items_offset[1]);
            if (dbottom < 0)
                return;
            this.items_group.y = this.config.items_offset[1] - (this.items_group.height - this.items_group.mask.height) * pos;
        }

        slide_up() {
            if (this.scroll_tween) {
                this.scroll_tween.stop();
                this.scroll_slider_tween.stop();
            }
            let dy = this.config.item_size[1];
            let dbottom = (this.items_group.y + this.items_group.height) - (this.bg.height - 2 * this.config.items_offset[1]);
            if (dbottom < 0)
                return;
            if (dbottom < dy)
                dy = dbottom;
            let rel_y = (this.items_group.height - this.items_group.mask.height);
            let pos = (this.items_group.y - dy) / rel_y;
            this.scroll_tween = _game.add.tween(this.items_group).to({y: this.items_group.y - dy}, 200, Phaser.Easing.Cubic.Out, true);
            this.scroll_slider_tween = _game.add.tween(this._slider).to({y: this._slider.min_y - this._slider.max_abs_y * pos}, 200, Phaser.Easing.Cubic.Out, true);
        }

        slide_down() {
            if (this.scroll_tween) {
                this.scroll_tween.stop();
                this.scroll_slider_tween.stop();
            }
            let dy = this.config.item_size[1];
            let dtop = this.config.items_offset[1] - this.items_group.y;
            if (dtop < dy)
                dy = dtop;
            let rel_y = (this.items_group.height - this.items_group.mask.height);
            let pos = (this.items_group.y + dy - this.config.items_offset[1]) / rel_y;
            this.scroll_tween = _game.add.tween(this.items_group).to({y: this.items_group.y + dy}, 200, Phaser.Easing.Cubic.Out, true);
            this.scroll_slider_tween = _game.add.tween(this._slider).to({y: this._slider.min_y - this._slider.max_abs_y * pos}, 200, Phaser.Easing.Cubic.Out, true);
        }

        init_events() {
            let self = this;
            _game.input.mouse.mouseWheelCallback = function () {
                if (_game.input.mouse.wheelDelta === Phaser.Mouse.WHEEL_UP) {
                    self.slide_down();
                } else {
                    self.slide_up();
                }
            };
        }
    }
}