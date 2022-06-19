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
