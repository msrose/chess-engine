use std::fmt;

pub enum Color {
    White,
    Black
}

pub enum Kind {
    King,
    Queen,
    Bishop,
    Knight,
    Rook,
    Pawn
}

pub struct Piece {
    color: Color,
    kind: Kind
}

impl Piece {
    pub fn from(letter: char) -> Piece {
        let kind = match letter {
            'K' | 'k' => Kind::King,
            'Q' | 'q' => Kind::Queen,
            'B' | 'b' => Kind::Bishop,
            'N' | 'n' => Kind::Knight,
            'R' | 'r' => Kind::Rook,
            'P' | 'p' => Kind::Pawn,
            _ => panic!("Unknown piece letter {}", letter)
        };
        let color = if letter.is_uppercase() {
            Color::White
        } else {
            Color::Black
        };
        Piece {
            color,
            kind
        }
    }
}

impl fmt::Display for Piece {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let character = match &self.kind {
            Kind::King => 'k',
            Kind::Queen => 'q',
            Kind::Bishop => 'b',
            Kind::Knight => 'n',
            Kind::Rook => 'r',
            Kind::Pawn => 'p'
        };
        let piece_string = match &self.color {
            Color::White => character.to_uppercase().to_string(),
            Color::Black => character.to_string()
        };
        write!(f, "{}", piece_string)
    }
}
