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

    pub fn from(coord: &str) -> Square {
        // TODO
        Square::empty(0, 0)
    }

    pub fn to_coord(&self) -> String {
        // TODO
        String::from("TODO")
    }

    pub fn with_piece(rank: u8, file: u8, piece: Piece) -> Square {
        Square {
            piece: Some(piece),
            ..Square::empty(rank, file)
        }
    }

    pub fn get_piece(&self) -> &Option<Piece> {
        &self.piece
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
