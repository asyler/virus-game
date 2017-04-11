/**
 * Created by asyler on 12.01.17.
 */

/// <reference path="resources.ts" />

R.fonts = {
    blue_1: {
        "fill":"#2ba6b7",
        "font":"bold 60px Arial"
    },
    white_1: {
        "fill": "#fefefe",
        "font": "bold 24px Arial",
        "stroke": "#000000",
        "strokeThickness": 2
    },
    gray_1: {
        "fill": "#aaaaaa",
        "font": "bold 24px Arial",
        "stroke": "#000000",
        "strokeThickness": 2
    },
    player_name_1: function (color: string) {
        return {
            "fill": color,
            "font": "bold 24px Arial",
            "stroke": "#000000",
            "strokeThickness": 2
        };
    }
}