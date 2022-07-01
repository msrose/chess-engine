use std::fmt;

type Result<T> = std::result::Result<T, PieceError>;

pub enum PieceError {
    InvalidLetter(char)
}

pub enum Color {
    White,
    Black
}

impl fmt::Display for Color {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let color_string = match *self {
            Color::White => "w",
            Color::Black => "b"
        };
        write!(f, "{}", color_string)
    }
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
    pub fn from(letter: char) -> Result<Self> {
        let kind = match letter {
            'K' | 'k' => Ok(Kind::King),
            'Q' | 'q' => Ok(Kind::Queen),
            'B' | 'b' => Ok(Kind::Bishop),
            'N' | 'n' => Ok(Kind::Knight),
            'R' | 'r' => Ok(Kind::Rook),
            'P' | 'p' => Ok(Kind::Pawn),
            _ => Err(PieceError::InvalidLetter(letter))
        }?;
        let color = if letter.is_uppercase() {
            Color::White
        } else {
            Color::Black
        };
        Ok(Piece {
            color,
            kind
        })
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
