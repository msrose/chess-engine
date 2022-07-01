use std::error;

mod board;
mod game;
mod square;
mod piece;

use game::Game;

fn main() -> Result<(), Box<dyn error::Error>>{
    let game = Game::from_fen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")?;
    game.print_board();
    Ok(())
}
