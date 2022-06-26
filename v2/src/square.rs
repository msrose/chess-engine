use std::fmt;
use crate::piece::Piece;

pub struct Square {
    rank: u8,
    file: u8,
    piece: Option<Piece>
}

impl Square {
    pub fn empty(rank: u8, file: u8) -> Square {
        Square {
            rank,
            file,
            piece: None
        }
    }

    pub fn with_piece(rank: u8, file: u8, piece: Piece) -> Square {
        Square {
            piece: Some(piece),
            ..Square::empty(rank, file)
        }
    }
}

impl fmt::Display for Square {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self.piece {
            Some(ref piece) => write!(f, "{}", piece),
            None => write!(f, "_")
        }
    }
}
