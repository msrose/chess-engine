class Board {
  constructor() {
    this.board = Array(8).fill().map(_ => Array(8).fill());

    this.put("ra8", "nb8", "bc8", "qd8", "ke8", "bf8", "ng8", "rh8");
    this.put("pa7", "pb7", "pc7", "pd7", "pe7", "pf7", "pg7", "ph7");

    this.put("Pa2", "Pb2", "Pc2", "Pd2", "Pe2", "Pf2", "Pg2", "Ph2");
    this.put("Ra1", "Nb1", "Bc1", "Qd1", "Ke1", "Bf1", "Ng1", "Rh1");

    this.toMove = "WHITE";
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

  get(square) {
    const fileIndex = "abcdefgh".split("").findIndex(f => square.file === f);
    const rankIndex = 7 - (square.rank - 1);
    return this.board[rankIndex] && this.board[rankIndex][fileIndex];
  }

  clear(square) {
    this.set(square, undefined);
  }

  set(square, piece) {
    const fileIndex = "abcdefgh".split("").findIndex(f => square.file === f);
    const rankIndex = 7 - (square.rank - 1);
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
    this.clear(finalPiece.square);
    this.set(destination, finalPiece.move(destination));
    this.toMove = this.toMove === "WHITE" ? "BLACK" : "WHITE";
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

  getLegalMoves(board) {
    const moves = [];
    if (this.letter === "P") {
      const twoMove = this.square.withRank("4");
      if (this.rank === "2" && !board.get(this.square.withRank("3")) && !board.get(twoMove)) {
        moves.push(twoMove);
      }
      const rightDiag = this.square.increment(1, 1);
      if (board.get(rightDiag)) {
        moves.push(rightDiag);
      }
      const leftDiag = this.square.increment(-1, 1);
      if (board.get(leftDiag)) {
        moves.push(leftDiag);
      }
      const oneMove = this.square.incrementRank(1)
      if (!board.get(oneMove)) {
        moves.push(oneMove);
      }
    } else if (this.letter === "p") {
      const twoMove = this.square.withRank("5")
      if (this.rank === "7" && !board.get(this.square.withRank("6")) && !board.get(twoMove)) {
        moves.push(twoMove);
      }
      const rightDiag = this.square.increment(-1, -1);
      if (board.get(rightDiag)) {
        moves.push(rightDiag);
      }
      const leftDiag = this.square.increment(1, -1);
      if (board.get(leftDiag)) {
        moves.push(leftDiag);
      }
      const oneMove = this.square.incrementRank(-1);
      if (!board.get(oneMove)) {
        moves.push(oneMove);
      }
    } else if (this.letter.toUpperCase() === "N") {
      moves.push(
        this.square.increment(2, 1),
        this.square.increment(2, -1),
        this.square.increment(-2, 1),
        this.square.increment(-2, -1),
        this.square.increment(1, 2),
        this.square.increment(-1, 2),
        this.square.increment(1, -2),
        this.square.increment(-1, -2),
      );
    } else if (this.letter.toUpperCase() === "K") {
      moves.push(
        this.square.increment(1, 0),
        this.square.increment(-1, 0),
        this.square.increment(0, -1),
        this.square.increment(0, 1),
        this.square.increment(1, 1),
        this.square.increment(1, -1),
        this.square.increment(-1, 1),
        this.square.increment(-1, -1),
      );
      return candidates.filter(candidate => !board.get(candidate) || board.get(candidate).isOpposingPiece(this));
    } else if (this.letter.toUpperCase() === "R") {
      const multipliers = [[1, 0], [-1, 0], [0, 1], [0, -1]]
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
    } else if (this.letter.toUpperCase() === "B") {
      const multipliers = [[1, 1], [-1, 1], [1, -1], [-1, -1]];
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
    } else if (this.letter.toUpperCase() === "Q") {
      moves.push(...new Piece(this.isBlack() ? "b" : "B", this.square).getLegalMoves(board))
      moves.push(...new Piece(this.isBlack() ? "r" : "R", this.square).getLegalMoves(board));
    }
    return moves.filter(candidate => !board.get(candidate) || board.get(candidate).isOpposingPiece(this));
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
      });
    } catch (e) {
      console.log(e);
    }
    handleMove();
  });
})();
