/**
 * Created by asyler on 12.01.17.
 */

R.strings = {
    game_name: 'Virus',
    start_game: 'Start game',
    player_info: (left_turns, player_color) => left_turns + " cells more for " + player_color.toString() + " player",
    game_over: (player_color) => "Game Over for " + player_color.toString() + " player"
}