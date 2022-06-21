fn main() {
    let board = Board::new();
    board.print();
}

const BOARD_SIZE: usize = 8;

struct Board {
    grid: [[char; BOARD_SIZE]; BOARD_SIZE]
}

impl Board {
    fn new() -> Board {
        Board {
            grid: [['X'; 8]; 8]
        }
    }

    fn print(&self) {
        for row in self.grid {
            for square in row {
                print!("{} ", square);
            }
            println!();
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn assert_board_has_grid() {
        let board = Board::new();
        assert_eq!(board.grid.len(), BOARD_SIZE);
        assert_eq!(board.grid[0].len(), BOARD_SIZE);
    }
}
