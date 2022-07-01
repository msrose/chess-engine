use std::fmt;
use std::error;
use std::num;

use crate::board::{Board, BoardError};
use crate::square::Square;
use crate::piece::Color;

type Result<T> = std::result::Result<T, GameError>;

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

impl fmt::Display for CastlingAvailability {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let mut castling_string = String::from("");
        if self.white_kingside {
            castling_string.push('K');
        }
        if self.white_queenside {
            castling_string.push('Q');
        }
        if self.black_kingside {
            castling_string.push('k');
        }
        if self.black_queenside {
            castling_string.push('q');
        }
        if castling_string.is_empty() {
            castling_string.push('-');
        }
        write!(f, "{}", castling_string)
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
    pub fn from_fen(fen: &str) -> Result<Game> {
        let parts: Vec<&str> = fen.split(" ").collect();
        if parts.len() != 6 {
            return Err(GameError::InvalidFen)
        }
        let board_string = parts[0];
        let color_string = parts[1];
        let castling_string = parts[2];
        let en_passant_string = parts[3];
        let halfmove_string = parts[4];
        let fullmove_string = parts[5];
        Ok(Game {
            board: Board::from_fen(board_string).map_err(GameError::from_board_error)?,
            active_color: match color_string {
                "w" => Ok(Color::White),
                "b" => Ok(Color::Black),
                _ => Err(GameError::InvalidFen)
            }?,
            castling_availability: CastlingAvailability::from(castling_string),
            en_passant_target_square: if en_passant_string == "-" {
                None
            } else {
                Some(Square::from(en_passant_string))
            },
            // TODO: verify halfmove >= 0
            halfmove_clock: halfmove_string.parse().map_err(GameError::from_fen_parse_error)?,
            // TODO: verify fullmove >= 1
            fullmove_number: fullmove_string.parse().map_err(GameError::from_fen_parse_error)?
        })
    }

    pub fn to_fen(&self) -> String {
        format!(
            "{} {} {} {} {} {}",
            self.board.to_fen(),
            self.active_color,
            self.castling_availability,
            self.en_passant_target_square.as_ref().map(Square::to_coord).unwrap_or(String::from("-")),
            self.halfmove_clock,
            self.fullmove_number
        )
    }

    pub fn print_board(&self) {
        print!("{}", self.board)
    }
}

#[derive(Debug, PartialEq)]
pub enum GameError {
    InvalidFen,
    InternalError(String)
}

impl GameError {
    fn from_board_error(err: BoardError) -> GameError {
        match err {
            BoardError::InvalidFen => GameError::InvalidFen,
            BoardError::InternalError(message) => GameError::InternalError(message)
        }
    }

    fn from_fen_parse_error(_: num::ParseIntError) -> GameError {
        GameError::InvalidFen
    }
}

impl fmt::Display for GameError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let message = match *self {
            GameError::InvalidFen => String::from("FEN is invalid"),
            GameError::InternalError(ref message) => String::from(message)
        };
        write!(f, "{}", message)
    }
}

impl error::Error for GameError {}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_from_fen_with_invald_fen_returns_error() {
        let err = Game::from_fen("blahblahblah").err().unwrap();
        assert_eq!(err, GameError::InvalidFen);
    }

    #[test]
    fn test_from_fen_to_fen_returns_same_fen() {
        let fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
        let game = Game::from_fen(&fen).ok().unwrap();
        assert_eq!(game.to_fen(), fen);
    }
}
