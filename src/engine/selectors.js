const {
  countCheckmate,
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
      return [NaN, [move]];
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
    return [NaN, moves];
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
    return [best, final];
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
    return 1;
  }
}

class MaterialSelector extends CountBasedSelector {
  getCounter() {
    return countMaterial;
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

class CombinedSelector extends CountBasedSelector {
  getCounter() {
    return board => {
      const weights = [
        [countCheckmate, 1],
        [countMaterial, 0.8],
        [countKingSafety, 0.1],
        [countDevelopment, 0.06],
        [countCentreControl, 0.04]
      ]
      return weights.reduce((total, [counter, weight]) => total + counter(board) * weight, 0) / (weights.length - 1);
    };
  }

  getDepth() {
    return 7;
  }
}

class RandomSelector {
  select(board, candidates) {
    return [NaN, [candidates[Math.floor(Math.random() * candidates.length)]]];
  }
}

module.exports = {
  CheckmateSelector,
  CheckmateDefenseSelector,
  MaterialSelector,
  KingSafetySelector,
  DevelopmentSelector,
  CentreControlSelector,
  CombinedSelector,
  RandomSelector,
};
