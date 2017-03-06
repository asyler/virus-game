/**
 * Created by asyler on 06.03.17.
 */

interface StateManager extends Phaser.StateManager {
    history: any;
    back: () => void;
    returning: boolean;
}