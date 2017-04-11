/**
 * Created by asyler on 06.03.17.
 */

/*
Use this class if you need to populate this state with some data,
which should be loaded from database.

Use _init() instead of init() to populate state with initial static data.
Use _start() instead of start().
Then, in preload() call wait(n) to tell state to wait for n events before execute start().
After each event handled use done() to tell state that 1 event is resolved.
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