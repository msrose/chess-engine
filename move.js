const Square = require('./square');

function parseMove(moveString) {
  if (moveString === "O-O") {
    return new KingsideCastle();
  }
  if (moveString === "O-O-O") {
    return new QueensideCastle();
  }
  let fullMove = moveString.replace("x", "");
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
  return new RegularMove(piece.toUpperCase(), disambiguator, destination);
}

class RegularMove {
  constructor(letter, disambiguator, destination) {
    this.letter = letter;
    this.disambiguator = disambiguator;
    this.destination = destination;
  }

  getExecutions(board) {
    const possiblePieces = board.getPieces().filter(piece => {
        return piece.isLetter(this.letter) &&
          piece.getLegalMoves(board)
            // excludes castling moves from consideration, which will have length two
            .filter(execution => execution.length === 1)
            .map(execution => String(execution[0][1]))
            .includes(String(this.destination)) &&
          piece.matchesDisambiguator(this.disambiguator);
    });
    return possiblePieces.map(piece => [[piece, this.destination]]);
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
