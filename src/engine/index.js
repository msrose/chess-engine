const {
  countMaterial,
  countKingSafety,
  countCentreControl,
  countDevelopment
} = require('./counters');

class CheckmateSelector {
  select(board, candidates) {
    const move = this.getMateInOne(board) || candidates.find(move => {
      const next = board.simulate(move);
      return next.getLegalMoves().every(move => {
        const nextNext = next.simulate(move);
        return this.getMateInOne(nextNext);
      });
    });
    if (move) {
      return [move];
    }
    return [];
  }

  getMateInOne(board) {
    return board.getLegalMoves().find(move => board.simulate(move).isCheckmate());
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

class CountBasedSelector {
  select(board, candidates) {
    const cache = new Map();
    const count = move => {
      return this.countNext(board, move, cache, this.getDepth());
    }
    const sorted = candidates.slice().sort((a, b) => {
      const materialA = count(a);
      const materialB = count(b);
      return board.isWhiteToMove() ? materialB - materialA : materialA - materialB;
    });
    const best = count(sorted[0]);
    const final = [];
    for (const move of sorted) {
      if (count(move) === best) {
        final.push(move);
      } else {
        break;
      }
    }
    return final;
  }

  countNext(board, move, cache, depth) {
    const next = board.simulate(move);
    const counter = this.getCounter();
    const executionString = move.map(([piece, destination]) => `${piece.letter}${piece.square}${destination}`).join("");
    const cacheKey = `${board}${executionString}`;
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }
    const score = counter(next);
    if (depth === 0) {
      cache.set(cacheKey, score);
      return score;
    }
    const nextCounts = next.getLegalMoves().map(move => this.countNext(next, move, cache, depth - 1));
    if (nextCounts.length === 0) {
      cache.set(cacheKey, score);
      return score;
    }
    const childScore = next.isWhiteToMove() ? Math.max(...nextCounts) : Math.min(...nextCounts);
    cache.set(cacheKey, childScore);
    return childScore;
  }

  getCounter() {
    throw new Error("getCounter must be implemented");
  }

  getDepth() {
    return 2;
  }
}

class MaterialSelector extends CountBasedSelector {
  getCounter() {
    return countMaterial;
  }

  getDepth() {
    return 2;
  }
}

class KingSafetySelector extends CountBasedSelector {
  getCounter() {
    return countKingSafety;
  }
}

class DevelopmentSelector extends CountBasedSelector {
  getCounter() {
    return countDevelopment;
  }
}

class CentreControlSelector extends CountBasedSelector {
  getCounter() {
    return countCentreControl;
  }
}

class RandomSelector {
  select(board, candidates) {
    return [candidates[Math.floor(Math.random() * candidates.length)]];
  }
}

class Engine {
  constructor({ verbose = false } = {}) {
    this.verbose = verbose;

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
      if (candidates.length === 1) {
        break;
      }
      this.log(selector.constructor.name + "...");
      const [selected, duration] = this.time(() => selector.select(board, candidates));
      this.log(duration + "\n");
      if (selected.length > 0) {
        candidates = selected;
      }
    }
    if (candidates.length !== 1) {
      throw new Error("Never narrowed down to one move! " + candidates);
    }
    return board.update(candidates[0]);
  }

  log(arg) {
    if (this.verbose) {
      process.stdout.write(arg);
    }
  }

  time(fn) {
    const start = Date.now();
    const result = fn();
    const end = Date.now();
    return [result, end - start];
  }
}

module.exports = Engine;
