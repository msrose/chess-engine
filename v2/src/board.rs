use std::fmt;
use crate::square::Square;
use crate::piece::Piece;

const BOARD_SIZE: usize = 8;

pub struct Board {
    grid: Vec<Vec<Square>>
}

impl Board {
    pub fn from_fen(board_fen: &str) -> Board {
        let ranks: Vec<&str> = board_fen.split("/").collect();
        if ranks.len() != BOARD_SIZE {
            panic!("Invalid board FEN {}", board_fen);
        }
        let mut grid = Vec::with_capacity(BOARD_SIZE);
        for (i, rank) in ranks.iter().enumerate() {
            let mut row = Vec::with_capacity(BOARD_SIZE);
            let rank_num = u8::try_from(i).ok().unwrap();
            for c in rank.chars() {
                if let Some(blanks) = c.to_digit(10) {
                    for _ in 0..blanks {
                        let file_num = u8::try_from(row.len()).ok().unwrap();
                        row.push(Square::empty(rank_num, file_num));
                    }
                } else {
                    let file_num = u8::try_from(row.len()).ok().unwrap();
                    row.push(Square::with_piece(rank_num, file_num, Piece::from(c)));
                }
            }
            grid.push(row);
        }
        Board {
            grid
        }
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn assert_board_has_grid() {
        let board = Board::from_fen("8/8/8/8/8/8/8/8");
        assert_eq!(board.grid.len(), BOARD_SIZE);
        assert_eq!(board.grid[0].len(), BOARD_SIZE);
    }
}
