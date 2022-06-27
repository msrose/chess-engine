use crate::board::Board;
use crate::square::Square;
use crate::piece::Color;

struct CastlingAvailability {
    white_kingside: bool,
    white_queenside: bool,
    black_kingside: bool,
    black_queenside: bool
}

impl CastlingAvailability {
    fn from(castling_string: &str) -> CastlingAvailability {
        CastlingAvailability {
            white_kingside: castling_string.contains("K"),
            white_queenside: castling_string.contains("Q"),
            black_kingside: castling_string.contains("k"),
            black_queenside: castling_string.contains("q")
        }
    }
}

pub struct Game {
    board: Board,
    active_color: Color,
    castling_availability: CastlingAvailability,
    en_passant_target_square: Option<Square>,
    halfmove_clock: u8,
    fullmove_number: u32
}

impl Game {
    pub fn from_fen(fen: &str) -> Game {
        let parts: Vec<&str> = fen.split(" ").collect();
        if parts.len() != 6 {
            panic!("Invalid FEN {}", fen);
        }
        let board_string = parts[0];
        let color_string = parts[1];
        let castling_string = parts[2];
        let en_passant_string = parts[3];
        let halfmove_string = parts[4];
        let fullmove_string = parts[5];
        Game {
            board: Board::from_fen(board_string),
            active_color: match color_string {
                "w" => Color::White,
                "b" => Color::Black,
                _ => panic!("Invalid color {}", color_string)
            },
            castling_availability: CastlingAvailability::from(castling_string),
            en_passant_target_square: if en_passant_string == "-" {
                None
            } else {
                Some(Square::from(en_passant_string))
            },
            halfmove_clock: halfmove_string.parse().ok().unwrap(),
            fullmove_number: fullmove_string.parse().ok().unwrap(),
        }
    }

    pub fn to_fen(&self) -> String {
        // TODO
        String::from("")
    }

    pub fn print_board(&self) {
        print!("{}", self.board)
    }
}
