/**
 * Created by asyler on 06.03.17.
 */

class DBState extends Phaser.State {
    wait_for_callbacks: number;
    callbacks_returned: number;
    __data;
    wait(n: number) {
        let self = this;
        this.wait_for_callbacks = n;
        this.callbacks_returned = 0;
        this.loadUpdate = function () {
            self.create();
        };

    }

    init(data) {
        this.__data = data;
        this._init(data);
    }

    done() {
        this.callbacks_returned++;
        this.create();
    }
    isDone() {
        return this.callbacks_returned == this.wait_for_callbacks && this.load.hasLoaded;
    }


    create():void {
        if (this.isDone())
             this._create();
    }

    _create() {

    }

    _init(data:any) {

    }
}