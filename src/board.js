const Piece = require('./piece');
const Square = require('./square');
const {parseMove} = require('./move');

class Board {
  constructor(board, toMove) {
    this.movesSinceCaptureOrPawn = 0;
    this.seenPositions = new Map();

    if (board) {
      this.board = board;
    } else {
      this.board = Array(8).fill().map(() => Array(8).fill());

      this.put("ra8", "nb8", "bc8", "qd8", "ke8", "bf8", "ng8", "rh8");
      this.put("pa7", "pb7", "pc7", "pd7", "pe7", "pf7", "pg7", "ph7");

      this.put("Pa2", "Pb2", "Pc2", "Pd2", "Pe2", "Pf2", "Pg2", "Ph2");
      this.put("Ra1", "Nb1", "Bc1", "Qd1", "Ke1", "Bf1", "Ng1", "Rh1");
    }

    if (toMove) {
      this.toMove = toMove;
    } else {
      this.toMove = "WHITE";
    }
  }

  print() {
    this.board.forEach((rank, rankNum) => {
      process.stdout.write(String(8 - rankNum + " | "))
      rank.forEach(square => {
        if (!square) {
          process.stdout.write("_ ");
        } else {
          process.stdout.write(square.letter + " ");
        }
      });
      process.stdout.write("\n");
    });
    process.stdout.write("    ---------------\n");
    process.stdout.write("    a b c d e f g h\n");
  }

  toString() {
    return this.board.map(rank => rank.map(piece => piece?.letter || "_").join("")).join("") + "|" + this.toMove;
  }

  put(...pieceSquares) {
    pieceSquares.forEach(pieceSquare => {
      const [piece, file, rank] = pieceSquare.split("");
      const square = new Square(file, rank);
      this.set(square, new Piece(piece, square));
    });
  }

  getIndices(square) {
    const fileIndex = "abcdefgh".split("").findIndex(f => square.file === f);
    const rankIndex = 7 - (square.rank - 1);
    return [fileIndex, rankIndex];
  }

  get(square) {
    const [fileIndex, rankIndex] = this.getIndices(square);
    return this.board[rankIndex] && this.board[rankIndex][fileIndex];
  }

  clear(square) {
    this.set(square, undefined);
  }

  set(square, piece) {
    const [fileIndex, rankIndex] = this.getIndices(square);
    this.board[rankIndex][fileIndex] = piece;
  }

  move(moveString) {
    const move = parseMove(moveString);
    const executions = move.getExecutions(this);

    if (executions.length === 0) {
      throw new Error("Illegal move " + moveString);
    }
    if (executions.length > 1) {
      throw new Error("Ambiguous move " + moveString);
    }

    const [finalExecution] = executions;
    this.update(finalExecution);
  }

  copy() {
    const copy = this.board.slice().map(rank => rank.slice().map(piece => piece && piece.copy()));
    return new Board(copy, this.toMove);
  }

  update(execution) {
    const pieceCountBefore = this.filter(piece => piece).length;

    this.filter(piece => piece).forEach(piece => {
      piece.expireEnPassantCandidacy();
    });
    execution.forEach(([piece, destination]) => {
      this.clear(piece.square);
      if (destination) {
        this.set(destination, piece.move(destination));
      }
    });
    this.toMove = this.toMove === "WHITE" ? "BLACK" : "WHITE";

    const pieceCountAfter = this.filter(piece => piece).length;

    const boardString = this.toString();
    this.seenPositions.set(boardString, (this.seenPositions.get(boardString) || 0) + 1);

    if (pieceCountBefore !== pieceCountAfter || execution[0][0].letter.toUpperCase() === "P") {
      this.movesSinceCaptureOrPawn = 0;
    } else {
      this.movesSinceCaptureOrPawn++;
    }
  }

  simulate(execution) {
    const copy = this.copy();
    copy.update(execution);
    return copy;
  }

  isStateValid() {
    if (this.toMove === "WHITE") {
      return !this.isBlackKingInCheck();
    } else {
      return !this.isWhiteKingInCheck();
    }
  }

  isBlackKingInCheck() {
    return this.isKingInCheck("k");
  }

  isWhiteKingInCheck() {
    return this.isKingInCheck("K");
  }

  isKingInCheck(letter) {
    const [king] = this.filter(piece => piece.letter === letter);
    const otherPieces = this.filter(piece => piece.isOpposingPiece(king));
    for (const piece of otherPieces) {
      if (piece.getSquaresAttacked(this).map(String).includes(String(king.square))) {
        return true;
      }
    }
    return false;
  }

  isKingsideAvailableForCastle(king) {
    const oneOver = king.square.incrementFile(1);
    const twoOver = king.square.incrementFile(2);
    return this.isSideAvailableForCastle(king, [oneOver, twoOver], "h");
  }

  isQueensideAvailableForCastle(king) {
    const oneOver = king.square.incrementFile(-1);
    const twoOver = king.square.incrementFile(-2);
    const threeOver = king.square.incrementFile(-3);
    return this.isSideAvailableForCastle(king, [oneOver, twoOver, threeOver], "a");
  }

  isSideAvailableForCastle(king, orderedOpenSquares, rookFile) {
    const [rook] = this.filter(piece => piece.isLetter("R") && piece.file === rookFile && !piece.isOpposingPiece(king));
    const otherPieces = this.filter(piece => piece.isOpposingPiece(king));
    return (
      rook &&
      !king.hasMoved &&
      !rook.hasMoved &&
      !orderedOpenSquares.some(square => this.get(square)) &&
      !this.isKingInCheck(king.letter) &&
      // Only check the first square over since castles that put the king in check will be filtered out of legal moves
      // Maybe this is a dumb thing to rely on or maybe better to do this check as part of legal move filtering
      !otherPieces.some(piece => piece.getSquaresAttacked(this).map(String).includes(String(orderedOpenSquares[0])))
    );
  }

  getPieces() {
    return this.filter(piece => this.toMove === "WHITE" ? piece.isWhite() : piece.isBlack());
  }

  getLegalMoves() {
    const pieces = this.getPieces();
    return pieces.flatMap(piece => piece.getLegalMoves(this));
  }

  isCheckmate() {
    return (this.toMove === "WHITE" ? this.isWhiteKingInCheck() : this.isBlackKingInCheck())
      && this.getLegalMoves().length === 0;
  }

  isDraw() {
    return this.isStalemate() || this.isDrawByRepetition() || this.isDrawByFiftyMoves();
  }

  isStalemate() {
    return !(this.toMove === "WHITE" ? this.isWhiteKingInCheck() : this.isBlackKingInCheck())
      && this.getLegalMoves().length === 0;
  }

  isDrawByRepetition() {
    return Array.from(this.seenPositions.values()).some(value => value === 3);
  }

  isDrawByFiftyMoves() {
    return this.movesSinceCaptureOrPawn / 2 === 50;
  }

  isGameOver() {
    return this.isCheckmate() || this.isDraw();
  }

  getResult() {
    if (this.isCheckmate()) {
      return this.toMove === "WHITE" ? "0-1" : "1-0";
    } else if (this.isDraw()) {
      return "1/2-1/2";
    } else {
      return "";
    }
  }

  filter(filter) {
    return this.board.flatMap(rank => rank).filter(Boolean).filter(filter);
  }

  hasSquare(square) {
    return "abcdefgh".includes(square.file) && "12345678".includes(square.rank);
  }
}

module.exports = Board;
