class Board {
  constructor(board, toMove) {
    if (board) {
      this.board = board;
    } else {
      this.board = Array(8).fill().map(_ => Array(8).fill());

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

  move(move) {
    let fullMove = move.replace("x", "");
    let disambiguator = "";
    if ("abcdefgh".includes(move[0])) {
      fullMove = "p" + fullMove;
    }
    if (fullMove.length === 4) {
      disambiguator = fullMove[1];
      fullMove = fullMove[0] + fullMove.slice(2);
    }
    let [piece, file, rank] = fullMove.split("");
    if (this.toMove === "WHITE") {
      piece = piece.toUpperCase();
    } else {
      piece = piece.toLowerCase();
    }
    const destination = new Square(file, rank);
    const canMove = [];
    this.board.forEach(rank => {
      rank.forEach(boardPiece => {
        if (boardPiece && boardPiece.letter === piece &&
          boardPiece.getLegalMoves(this).map(String).includes(String(destination)) &&
          (disambiguator ? (boardPiece.file === disambiguator || boardPiece.rank === disambiguator) : true)) {
          canMove.push(boardPiece);
        }
      });
    });

    if (canMove.length === 0) {
      throw new Error("Illegal move " + move);
    }
    if (canMove.length > 1) {
      throw new Error("Ambiguous move " + move);
    }

    const [finalPiece] = canMove;
    this.update(finalPiece, destination);
  }

  copy() {
    const copy = this.board.slice().map(rank => rank.slice());
    return new Board(copy, this.toMove);
  }

  update(piece, destination) {
    this.clear(piece.square);
    this.set(destination, piece.move(destination));
    this.toMove = this.toMove === "WHITE" ? "BLACK" : "WHITE";
  }

  simulate(piece, destination) {
    const copy = this.copy();
    copy.update(piece, destination);
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

  getLegalMoves() {
    const pieces = this.filter(piece => this.toMove === "WHITE" ? piece.isWhite() : piece.isBlack());
    return pieces.flatMap(piece => piece.getLegalMoves(this).map(square => [piece, square]));
  }

  isCheckmate() {
    return (this.toMove === "WHITE" ? this.isWhiteKingInCheck() : this.isBlackKingInCheck())
      && this.getLegalMoves().length === 0;
  }

  isStalemate() {
    return !(this.toMove === "WHITE" ? this.isWhiteKingInCheck() : this.isBlackKingInCheck())
      && this.getLegalMoves().length === 0;
  }

  isGameOver() {
    return this.isCheckmate() || this.isStalemate();
  }

  getResult() {
    if (this.isCheckmate()) {
      return this.toMove === "WHITE" ? "0-1" : "1-0";
    } else if (this.isStalemate()) {
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

class Square {
  constructor(arg1, arg2) {
    let file = arg1;
    let rank = arg2;
    if (!arg2) {
      [file, rank] = arg1.split("");
    }
    this.file = String(file);
    this.rank = String(rank);
  }

  withFile(file) {
    return new Square(file, this.rank);
  }

  withRank(rank) {
    return new Square(this.file, rank);
  }

  incrementFile(count) {
    const files = "abcdefgh".split("");
    return this.withFile(files[files.findIndex(f => f === this.file) + count]);
  }

  incrementRank(count) {
    return this.withRank(Number(this.rank) + count);
  }

  increment(fileCount, rankCount) {
    return this.incrementFile(fileCount).incrementRank(rankCount);
  }

  toString() {
    return this.file + this.rank;
  }
}

class Piece {
  constructor(letter, square) {
    this.letter = letter;
    this.square = square;
  }

  get file() {
    return this.square.file;
  }

  get rank() {
    return this.square.rank;
  }

  isBlack() {
    return this.letter.toUpperCase() !== this.letter;
  }

  isWhite() {
    return !this.isBlack();
  }

  isOpposingPiece(other) {
    return this.isBlack() ? other.isWhite() : other.isBlack();
  }

  getSquaresAttacked(board) {
    const squares = [];
    if (this.letter === "P") {
      const rightDiag = this.square.increment(1, 1);
      squares.push(rightDiag);
      const leftDiag = this.square.increment(-1, 1);
      squares.push(leftDiag);
    } else if (this.letter === "p") {
      const rightDiag = this.square.increment(-1, -1);
      squares.push(rightDiag);
      const leftDiag = this.square.increment(1, -1);
      squares.push(leftDiag);
    } else if (this.letter.toUpperCase() === "N") {
      const coords = [[2, 1], [2, -1], [-2, 1], [-2, -1], [1, 2], [-1, 2], [1, -2], [-1, -2]];
      squares.push(...coords.map(([fInc, rInc]) => this.square.increment(fInc, rInc)));
    } else if (this.letter.toUpperCase() === "K") {
      const coords = [[1, 0], [-1, 0], [0, -1], [0, 1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
      squares.push(...coords.map(([fInc, rInc]) => this.square.increment(fInc, rInc)));
    } else if (this.letter.toUpperCase() === "R") {
      squares.push(...this.traverse(board, [[1, 0], [-1, 0], [0, 1], [0, -1]]));
    } else if (this.letter.toUpperCase() === "B") {
      squares.push(...this.traverse(board, [[1, 1], [-1, 1], [1, -1], [-1, -1]]));
    } else if (this.letter.toUpperCase() === "Q") {
      squares.push(...new Piece(this.isBlack() ? "b" : "B", this.square).getSquaresAttacked(board))
      squares.push(...new Piece(this.isBlack() ? "r" : "R", this.square).getSquaresAttacked(board));
    }
    return squares.filter(candidate => board.hasSquare(candidate));
  }

  getLegalMoves(board) {
    let moves = this.getSquaresAttacked(board);
    if (this.letter === "P") {
      const twoMove = this.square.withRank("4");
      if (this.rank === "2" && !board.get(this.square.withRank("3")) && !board.get(twoMove)) {
        moves.push(twoMove);
      }
      const oneMove = this.square.incrementRank(1)
      if (!board.get(oneMove)) {
        moves.push(oneMove);
      }
      const rightDiag = this.square.increment(1, 1);
      if (!board.get(rightDiag)) {
        moves = moves.filter(square => String(square) !== String(rightDiag))
      }
      const leftDiag = this.square.increment(-1, 1);
      if (!board.get(leftDiag)) {
        moves = moves.filter(square => String(square) !== String(leftDiag))
      }
    } else if (this.letter === "p") {
      const twoMove = this.square.withRank("5")
      if (this.rank === "7" && !board.get(this.square.withRank("6")) && !board.get(twoMove)) {
        moves.push(twoMove);
      }
      const oneMove = this.square.incrementRank(-1);
      if (!board.get(oneMove)) {
        moves.push(oneMove);
      }
      const rightDiag = this.square.increment(-1, -1);
      if (!board.get(rightDiag)) {
        moves = moves.filter(square => String(square) !== String(rightDiag))
      }
      const leftDiag = this.square.increment(1, -1);
      if (!board.get(leftDiag)) {
        moves = moves.filter(square => String(square) !== String(leftDiag))
      }
    }
    return moves
      .filter(candidate => !board.get(candidate) || board.get(candidate).isOpposingPiece(this))
      .filter(candidate => board.simulate(this, candidate).isStateValid());
  }

  traverse(board, multipliers) {
    const moves = [];
    multipliers.forEach(([fMult, rMult]) => {
      let increment = 1;
      while (true) {
        const square = this.square.increment(increment * fMult, increment * rMult);
        if (!board.hasSquare(square)) {
          break;
        }
        moves.push(square);
        if (board.get(square)) {
          break;
        }
        increment++;
      }
    });
    return moves;
  }

  move(destination) {
    return new Piece(this.letter, destination);
  }
}

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const board = new Board();

(function handleMove() {
  board.print();
  console.log("===================");
  rl.question("Enter moves: ", answer => {
    try {
      answer.split(" ").filter(Boolean).forEach(move => {
        board.move(move);
        if (board.isGameOver()) {
          board.print();
          console.log(board.getResult())
          process.exit(0);
        }
      });
    } catch (e) {
      console.log(e);
    }
    handleMove();
  });
})();
