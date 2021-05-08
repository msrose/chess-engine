const Square = require('./square');

function parseMove(moveString) {
  if (moveString.toUpperCase() === "O-O") {
    return new KingsideCastle();
  }
  if (moveString.toUpperCase() === "O-O-O") {
    return new QueensideCastle();
  }
  let [fullMove, promotion] = moveString.replace("x", "").split("=");
  let disambiguator = "";
  if ("abcdefgh".includes(moveString[0])) {
    fullMove = "p" + fullMove;
  }
  if (fullMove.length === 4) {
    disambiguator = fullMove[1];
    fullMove = fullMove[0] + fullMove.slice(2);
  }
  let [piece, file, rank] = fullMove.split("");
  const destination = new Square(file, rank);
  return new RegularMove(piece.toUpperCase(), disambiguator, destination, promotion);
}

class RegularMove {
  constructor(letter, disambiguator, destination, promotion) {
    this.letter = letter;
    this.disambiguator = disambiguator;
    this.destination = destination;
    this.promotion = promotion;
  }

  getExecutions(board) {
    return board.getPieces().flatMap(piece => {
      if (!piece.isLetter(this.letter) || !piece.matchesDisambiguator(this.disambiguator)) {
        return [];
      }
      return piece.getLegalMoves(board).filter(execution =>
        // exclude castling moves
        execution.map(([{ letter }]) => letter).join("").toUpperCase() !== "KR" &&
        // exclude moves where the first piece moved does not end up at the expected destination
        String(execution[0][1]) === String(this.destination) &&
        // exclude pawn moves to eighth rank that don't promote to same piece
        (!this.promotion || execution[1]?.[0].letter.toUpperCase() === this.promotion.toUpperCase())
      );
    });
  }
}

class KingsideCastle {
  getExecutions(board) {
    const [king] = board.getPieces().filter(piece => piece.isLetter("K"));
    if (!board.isKingsideAvailableForCastle(king)) {
      return [];
    }
    const [rook] = board.getPieces().filter(piece => piece.isLetter("R") && piece.file === "h");
    return [
      [
        [king, king.square.incrementFile(2)],
        [rook, rook.square.incrementFile(-2)]
      ],
    ]
  }
}

class QueensideCastle {
  getExecutions(board) {
    const [king] = board.getPieces().filter(piece => piece.isLetter("K"));
    if (!board.isQueensideAvailableForCastle(king)) {
      return [];
    }
    const [rook] = board.getPieces().filter(piece => piece.isLetter("R") && piece.file === "a");
    return [
      [
        [king, king.square.incrementFile(-2)],
        [rook, rook.square.incrementFile(3)]
      ],
    ]
  }
}

module.exports = {
  parseMove,
  RegularMove,
  KingsideCastle,
  QueensideCastle
};
