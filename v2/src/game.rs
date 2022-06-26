use crate::board::Board;
use crate::square::Square;

struct CastlingAvailability {
    white_kingside: bool,
    white_queenside: bool,
    black_kingside: bool,
    black_queenside: bool
}

pub struct Game {
    board: Board,
    active_color: char,
    castling_availability: CastlingAvailability,
    en_passant_target_square: Option<Square>,
    halfmove_clock: u32,
    fullmove_number: u32
}

impl Game {
    pub fn new(board: Board) -> Game {
        Game {
            board,
            active_color: 'w',
            castling_availability: CastlingAvailability {
                white_kingside: true,
                white_queenside: true,
                black_kingside: true,
                black_queenside: true
            },
            en_passant_target_square: None,
            halfmove_clock: 0,
            fullmove_number: 0
        }
    }

    pub fn print_board(&self) {
        print!("{}", self.board)
    }
}
