class CheckmateSelector {
  select(board, candidates) {
    for (const move of candidates) {
      const next = board.simulate(move);
      if (next.isCheckmate()) {
        return [move];
      }
    }
    return [];
  }
}

class CheckmateDefenseSelector {
  select(board, candidates) {
    let moves = candidates;
    for (const move of candidates) {
      const next = board.simulate(move);
      if (new CheckmateSelector().select(next, next.getLegalMoves()).length > 0) {
        moves = moves.filter(m => m != move);
      }
    }
    return moves;
  }
}

class MaterialSelector {
  select(board, candidates) {
    const cache = new Map();
    const getMaterial = move => {
      return this.countNextMaterial(board, move, cache);
    }
    const sorted = candidates.slice().sort((a, b) => {
      const materialA = getMaterial(a);
      const materialB = getMaterial(b);
      return board.isWhiteToMove() ? materialB - materialA : materialA - materialB;
    });
    const best = getMaterial(sorted[0]);
    const final = [];
    for (const move of sorted) {
      if (getMaterial(move) === best) {
        final.push(move);
      } else {
        break;
      }
    }
    return final;
  }

  countNextMaterial(board, move, cache, depth = 2) {
    const next = board.simulate(move);
    const executionString = move.map(([piece, destination]) => `${piece.letter}${piece.square}${destination}`).join("");
    const cacheKey = `${board}${executionString}`;
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }
    const score = this.countMaterial(next);
    if (depth === 0) {
      cache.set(cacheKey, score);
      return score;
    }
    const nextCounts = next.getLegalMoves().map(move => this.countNextMaterial(next, move, cache, depth - 1));
    if (nextCounts.length === 0) {
      cache.set(cacheKey, score);
      return score;
    }
    const childScore = next.isWhiteToMove() ? Math.max(...nextCounts) : Math.min(...nextCounts);
    cache.set(cacheKey, childScore);
    return childScore;
  }

  countMaterial(board) {
    const reducer = (total, piece) => {
      return total + ({Q: 9, R: 5, B: 3, N: 3, P: 1}[piece.letter.toUpperCase()] || 0);
    };
    const white = board.filter(piece => piece.isWhite()).reduce(reducer, 0);
    const black = board.filter(piece => piece.isBlack()).reduce(reducer, 0);
    return white - black;
  }
}

class KingSafetySelector {
  select(board, candidates) {
    const sorted = candidates.slice().sort((a, b) => {
      const safetyA = this.countKingSafety(board.simulate(a));
      const safetyB = this.countKingSafety(board.simulate(b));
      return board.isWhiteToMove() ? safetyB - safetyA : safetyA - safetyB;
    });
    const best = this.countKingSafety(board.simulate(sorted[0]));
    const final = [];
    for (const move of sorted) {
      if (this.countKingSafety(board.simulate(move)) === best) {
        final.push(move);
      } else {
        break;
      }
    }
    return final;
  }

  countKingSafety(board) {
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
}

class DevelopmentSelector {
  select(board, candidates) {
    const sorted = candidates.slice().sort((a, b) => {
      const developmentA = this.countDevelopment(board.simulate(a));
      const developmentB = this.countDevelopment(board.simulate(b));
      return board.isWhiteToMove() ? developmentB - developmentA : developmentA - developmentB;
    });
    const best = this.countDevelopment(board.simulate(sorted[0]));
    const final = [];
    for (const move of sorted) {
      if (this.countDevelopment(board.simulate(move)) === best) {
        final.push(move);
      } else {
        break;
      }
    }
    return final;
  }

  countDevelopment(board) {
    const white = board.filter(piece => piece.isWhite()).reduce((total, piece) => total + piece.getSquaresAttacked(board).length, 0);
    const black = board.filter(piece => piece.isBlack()).reduce((total, piece) => total + piece.getSquaresAttacked(board).length, 0);
    return white - black;
  }
}

class CentreControlSelector {
  select(board, candidates) {
    const sorted = candidates.slice().sort((a, b) => {
      const controlA = this.countCentreControl(board.simulate(a));
      const controlB = this.countCentreControl(board.simulate(b));
      return board.isWhiteToMove() ? controlB - controlA : controlA - controlB;
    });
    const best = this.countCentreControl(board.simulate(sorted[0]));
    const final = [];
    for (const move of sorted) {
      if (this.countCentreControl(board.simulate(move)) === best) {
        final.push(move);
      } else {
        break;
      }
    }
    return final;
  }

  countCentreControl(board) {
    const centreSquares = ["e4", "e5", "d4", "d5"];
    const reducer = (total, piece) => {
      let score = 0;
      if (centreSquares.includes(piece.square.toString())) {
        score++;
      }
      const squaresAttacked = piece.getSquaresAttacked(board).map(String);
      score += squaresAttacked.filter(square => centreSquares.includes(square)).length;
      if (!piece.hasMoved) {
        score++;
      }
      return total + score;
    }
    const white = board.filter(piece => piece.isWhite()).reduce(reducer, 0);
    const black = board.filter(piece => piece.isBlack()).reduce(reducer, 0);
    return white - black;
  }
}

class RandomSelector {
  select(board, candidates) {
    return [candidates[Math.floor(Math.random() * candidates.length)]];
  }
}

class Engine {
  constructor() {
    this.selectors = [
      new CheckmateSelector(),
      new CheckmateDefenseSelector(),
      new MaterialSelector(),
      new KingSafetySelector(),
      // Development before centre control will play e4
      new DevelopmentSelector(),
      // Centre control before development will play d4
      new CentreControlSelector(),
      new RandomSelector()
    ]
  }

  move(board) {
    let candidates = board.getLegalMoves();
    for (const selector of this.selectors) {
      candidates = selector.select(board, candidates);
      if (candidates.length === 1) {
        return board.update(candidates[0]);
      } else if (candidates.length === 0) {
        candidates = board.getLegalMoves();
      }
    }
    throw new Error("Never narrowed down to one move!");
  }
}

module.exports = Engine;
