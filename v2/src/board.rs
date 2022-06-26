use std::fmt;
use crate::square::Square;

const BOARD_SIZE: u8 = 8;

pub struct Board {
    grid: Vec<Vec<Square>>
}

impl Board {
    pub fn new() -> Board {
        let mut grid = Vec::with_capacity(usize::from(BOARD_SIZE));
        for rank in 0..BOARD_SIZE {
            let mut row = Vec::with_capacity(usize::from(BOARD_SIZE));
            for file in 0..BOARD_SIZE {
                row.push(Square::empty(rank, file))
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
        for rank in &self.grid {
            for square in rank {
                result = format!("{}{} ", result, square);
            }
            result = format!("{}\n", result)
        }
        write!(f, "{}", result)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn assert_board_has_grid() {
        let board = Board::new();
        assert_eq!(board.grid.len(), usize::from(BOARD_SIZE));
        assert_eq!(board.grid[0].len(), usize::from(BOARD_SIZE));
    }
}
