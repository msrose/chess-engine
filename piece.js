const {KingsideCastle, QueensideCastle} = require('./move');

class Piece {
  constructor(letter, square, hasMoved = false) {
    this.letter = letter;
    this.square = square;
    this.hasMoved = hasMoved;
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
    let squares = this.getSquaresAttacked(board);
    if (this.letter === "P") {
      const twoMove = this.square.withRank("4");
      if (this.rank === "2" && !board.get(this.square.withRank("3")) && !board.get(twoMove)) {
        squares.push(twoMove);
      }
      const oneMove = this.square.incrementRank(1)
      if (!board.get(oneMove)) {
        squares.push(oneMove);
      }
      const rightDiag = this.square.increment(1, 1);
      if (!board.get(rightDiag)) {
        squares = squares.filter(square => String(square) !== String(rightDiag))
      }
      const leftDiag = this.square.increment(-1, 1);
      if (!board.get(leftDiag)) {
        squares = squares.filter(square => String(square) !== String(leftDiag))
      }
    } else if (this.letter === "p") {
      const twoMove = this.square.withRank("5")
      if (this.rank === "7" && !board.get(this.square.withRank("6")) && !board.get(twoMove)) {
        squares.push(twoMove);
      }
      const oneMove = this.square.incrementRank(-1);
      if (!board.get(oneMove)) {
        squares.push(oneMove);
      }
      const rightDiag = this.square.increment(-1, -1);
      if (!board.get(rightDiag)) {
        squares = squares.filter(square => String(square) !== String(rightDiag))
      }
      const leftDiag = this.square.increment(1, -1);
      if (!board.get(leftDiag)) {
        squares = squares.filter(square => String(square) !== String(leftDiag))
      }
    }
    const executions = squares
      .filter(candidate => !board.get(candidate) || board.get(candidate).isOpposingPiece(this))
      .map(square => [[this, square]])
    if (this.letter.toUpperCase() === "K") {
      executions.push(...new KingsideCastle().getExecutions(board));
      executions.push(...new QueensideCastle().getExecutions(board));
    }
    return executions.filter(execution => board.simulate(execution).isStateValid());
  }

  traverse(board, multipliers) {
    const moves = [];
    multipliers.forEach(([fMult, rMult]) => {
      let increment = 1;
      for (;;) {
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
    return new Piece(this.letter, destination, true);
  }

  isLetter(letter) {
    return this.letter.toUpperCase() === letter.toUpperCase();
  }

  matchesDisambiguator(disambiguator) {
    return !disambiguator || this.file === disambiguator || this.rank === disambiguator;
  }
}

module.exports = Piece;
