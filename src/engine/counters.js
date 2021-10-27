function countCheckmate(board) {
  return board.isCheckmate() ? board.isWhiteToMove() ? -1000000 : 1000000 : 0;
}

function countMaterial(board) {
  const reducer = (total, piece) => {
    return total + ({Q: 9, R: 5, B: 3, N: 3, P: 1}[piece.letter.toUpperCase()] || 0);
  };
  const white = board.filter(piece => piece.isWhite()).reduce(reducer, 0);
  const black = board.filter(piece => piece.isBlack()).reduce(reducer, 0);
  return white - black;
}

function countKingSafety(board) {
  const [whiteKing] = board.filter(piece => piece.letter === "K");
  const [blackKing] = board.filter(piece => piece.letter === "k");
  let white = 0;
  let black = 0;
  // Kings get stuck to back rank with this, leave off for now
  // white -= whiteKing.rank - 1;
  // white += (16 - board.filter(piece => piece.isBlack()).length) / 2;
  if (whiteKing.hasCastled) {
    white += 3;
  }
  if (board.isKingsideAvailableForCastle(whiteKing)) {
    white++;
  }
  if (board.isQueensideAvailableForCastle(whiteKing)) {
    white++;
  }
  // black -= 8 - blackKing.rank;
  // black += (16 - board.filter(piece => piece.isWhite()).length) / 2;
  if (blackKing.hasCastled) {
    black += 3;
  }
  if (board.isKingsideAvailableForCastle(blackKing)) {
    black++;
  }
  if (board.isQueensideAvailableForCastle(blackKing)) {
    black++;
  }
  return white - black;
}

function countDevelopment(board) {
  const white = board.filter(piece => piece.isWhite()).reduce((total, piece) => total + piece.getSquaresAttacked(board).length, 0);
  const black = board.filter(piece => piece.isBlack()).reduce((total, piece) => total + piece.getSquaresAttacked(board).length, 0);
  return white - black;
}

function countCentreControl(board) {
  const centreSquares = ["e4", "e5", "d4", "d5"];
  const reducer = (total, piece) => {
    let score = 0;
    if (centreSquares.includes(piece.square.toString())) {
      score++;
    }
    const squaresAttacked = piece.getSquaresAttacked(board).map(String);
    score += squaresAttacked.filter(square => centreSquares.includes(square)).length;
    return total + score;
  }
  const white = board.filter(piece => piece.isWhite()).reduce(reducer, 0);
  const black = board.filter(piece => piece.isBlack()).reduce(reducer, 0);
  return white - black;
}

module.exports = {
  countCheckmate,
  countMaterial,
  countKingSafety,
  countDevelopment,
  countCentreControl
};
