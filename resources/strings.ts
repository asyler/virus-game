/**
 * Created by asyler on 12.01.17.
 */

/// <reference path="resources.ts" />

R.strings = {
    game_name: 'Virus',
    start_game: 'Start game',
    create_game: 'Create game',
    join_game: 'Join game',
    resume_game: 'Resume game',
    login: 'Login',
    register: 'Register',
    'game#': 'Game #',
    'player_count': 'Players',
    'players': 'Players',
    player_info: (left_turns, player_color) => left_turns + " cells more for " + player_color.toString() + " player",
    game_over: (player_color) => "Game Over for " + player_color.toString() + " player"
}