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
      const material = cache.has(move) ? cache.get(move) : this.countNextMaterial(board, move);
      cache.set(move, material);
      return material;
    }
    const sorted = candidates.slice().sort((a, b) => {
      const materialA = getMaterial(a);
      const materialB = getMaterial(b);
      return board.toMove === "WHITE" ? materialB - materialA : materialA - materialB;
    });
    // for (const [key, value] of cache) {
    //   console.log(key[0][0].letter, String(key[0][1]), value)
    // }
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

  countNextMaterial(board, move, depth = 1) {
    const next = board.simulate(move);
    const score = this.countMaterial(next);
    if (depth === 0) {
      return score;
    }
    const nextCounts = next.getLegalMoves().map(move => this.countNextMaterial(next, move, depth - 1));
    return nextCounts.reduce((max, val) => Math.abs(val) > Math.abs(max) ? val : max, score)
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
