/**
 * Created by asyler on 06.03.17.
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var DBState = (function (_super) {
    __extends(DBState, _super);
    function DBState() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DBState.prototype.wait = function (n) {
        var self = this;
        this.wait_for_callbacks = n;
        this.callbacks_returned = 0;
        this.loadUpdate = function () {
            self.create();
        };
    };
    DBState.prototype.init = function (data) {
        this.__data = data;
        this._init(data);
    };
    DBState.prototype.done = function () {
        this.callbacks_returned++;
        this.create();
    };
    DBState.prototype.isDone = function () {
        return this.callbacks_returned == this.wait_for_callbacks && this.load.hasLoaded;
    };
    DBState.prototype.create = function () {
        if (this.isDone())
            this._create();
    };
    DBState.prototype._create = function () {
    };
    DBState.prototype._init = function (data) {
    };
    return DBState;
}(Phaser.State));
