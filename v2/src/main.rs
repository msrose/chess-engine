mod board;
mod game;
mod square;
mod piece;

use board::Board;
use game::Game;

fn main() {
    let board = Board::new();
    let game = Game::new(board);
    game.print_board();
}
