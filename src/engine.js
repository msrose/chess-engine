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
    const sorted = candidates.slice().sort((a, b) => {
      const materialA = cache.has(a) ? cache.get(a) : this.countMaterial(board, a);
      cache.set(a, materialA);
      const materialB = cache.has(b) ? cache.get(b) : this.countMaterial(board, b);
      cache.set(b, materialB);
      return this.toMove === "WHITE" ? materialB - materialA : materialA - materialB;
    });
    const best = cache.has(sorted[0]) ? cache.get(sorted[0]) : this.countMaterial(board, sorted[0]);
    const final = [];
    for (const move of sorted) {
      if ((cache.has(move) ? cache.get(move) : this.countMaterial(board, move)) === best) {
        final.push(move);
      } else {
        break;
      }
    }
    return final;
  }

  countMaterial(board, move, depth = 1) {
    const next = board.simulate(move);
    const reducer = (total, piece) => {
      return total + ({Q: 9, R: 5, B: 3, N: 3, P: 1}[piece.letter.toUpperCase()] || 0);
    };
    const white = next.filter(piece => piece.isWhite()).reduce(reducer, 0);
    const black = next.filter(piece => piece.isBlack()).reduce(reducer, 0);
    const score = white - black;
    if (depth === 0) {
      return score;
    }
    const nextCounts = next.getLegalMoves().map(move => this.countMaterial(next, move, depth - 1));
    return nextCounts.reduce((max, val) => Math.abs(val) > Math.abs(max) ? val : max, score)
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
      new RandomSelector()
    ]
  }

  move(board) {
    let candidates = board.getLegalMoves();
    for (const selector of this.selectors) {
      candidates = selector.select(board, candidates);
      if (candidates.length === 1) {
        board.update(candidates[0]);
        candidates[0].forEach(([piece, destination]) => {
          console.log(`${piece.letter.toUpperCase() !== "P" ? piece.letter.toUpperCase() : ""}${destination.toString()}`);
        });
        return;
      } else if (candidates.length === 0) {
        candidates = board.getLegalMoves();
      }
    }
    throw new Error("Never narrowed down to one move!");
  }
}

module.exports = Engine;
