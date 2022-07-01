use std::fmt;

use crate::square::Square;
use crate::piece::{Piece, PieceError};

type Result<T> = std::result::Result<T, BoardError>;

const BOARD_SIZE: usize = 8;

pub struct Board {
    grid: Vec<Vec<Square>>
}

impl Board {
    pub fn from_fen(board_fen: &str) -> Result<Board> {
        let ranks: Vec<&str> = board_fen.split("/").collect();
        if ranks.len() != BOARD_SIZE {
            return Err(BoardError::InvalidFen);
        }
        let mut grid = Vec::with_capacity(BOARD_SIZE);
        for (i, rank) in ranks.iter().enumerate() {
            let mut row = Vec::with_capacity(BOARD_SIZE);
            let rank_num = u8::try_from(i).map_err(BoardError::from_u8_conversion)?;
            for c in rank.chars() {
                if let Some(blanks) = c.to_digit(10) {
                    for _ in 0..blanks {
                        let file_num = u8::try_from(row.len()).map_err(BoardError::from_u8_conversion)?;
                        row.push(Square::empty(rank_num, file_num));
                    }
                } else {
                    let file_num = u8::try_from(row.len()).map_err(BoardError::from_u8_conversion)?;
                    row.push(Square::with_piece(rank_num, file_num, Piece::from(c).map_err(BoardError::from_piece_error)?));
                }
            }
            grid.push(row);
        }
        Ok(Board {
            grid
        })
    }

    pub fn to_fen(&self) -> String {
        let mut ranks: Vec<String> = Vec::with_capacity(BOARD_SIZE);
        for rank in &self.grid {
            let mut rank_fen = String::from("");
            let mut blank_count = 0;
            for square in rank {
                if let Some(piece) = square.get_piece() {
                    if blank_count > 0 {
                        rank_fen.push_str(&blank_count.to_string());
                        blank_count = 0;
                    }
                    rank_fen.push_str(&format!("{}", piece));
                } else {
                    blank_count = blank_count + 1;
                }
            }
            if blank_count > 0 {
                rank_fen.push_str(&blank_count.to_string());
            }
            ranks.push(rank_fen);
        }
        ranks.join("/")
    }
}

impl fmt::Display for Board {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let mut result = String::from("");
        let mut rank_num = BOARD_SIZE;
        for rank in &self.grid {
            result.push_str(format!("{} | ", rank_num).as_str());
            for square in rank {
                result.push_str(format!("{} ", square).as_str());
            }
            result.push('\n');
            rank_num = rank_num - 1;
        }
        result.push_str("    ---------------\n");
        result.push_str("    a b c d e f g h\n");
        write!(f, "{}", result)
    }
}

#[derive(Debug, PartialEq)]
pub enum BoardError {
    InvalidFen,
    InternalError(String)
}

impl BoardError {
    fn from_u8_conversion(err: std::num::TryFromIntError) -> BoardError {
        BoardError::InternalError(format!("Could not convert to u8 value: {}", err))
    }

    fn from_piece_error(err: PieceError) -> BoardError {
        match err {
            PieceError::InvalidLetter(_) => BoardError::InvalidFen
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn assert_board_has_grid() {
        let board = Board::from_fen("8/8/8/8/8/8/8/8").ok().unwrap();
        assert_eq!(board.grid.len(), BOARD_SIZE);
        assert_eq!(board.grid[0].len(), BOARD_SIZE);
    }

    #[test]
    fn assert_board_from_invalid_fen_is_error() {
        let err = Board::from_fen("8/8/8/8/8").err().unwrap();
        assert_eq!(err, BoardError::InvalidFen);
    }

    #[test]
    fn assert_board_from_fen_to_fen_is_same() {
        let fen = "8/8/8/8/8/8/8/8";
        let board = Board::from_fen(fen).ok().unwrap();
        assert_eq!(fen, board.to_fen());
    }
}
