const { CombinedSelector, RandomSelector } = require('./selectors');

class Engine {
  constructor({ verbose = false } = {}) {
    this.verbose = verbose;

    this.selectors = [
      // new CheckmateSelector(),
      // new CheckmateDefenseSelector(),
      // new MaterialSelector(),
      // new KingSafetySelector(),
      // Development before centre control will play e4
      // new DevelopmentSelector(),
      // Centre control before development will play d4
      // new CentreControlSelector(),
      new CombinedSelector(),
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
      const [[evaluation, selected], duration] = this.time(() => selector.select(board, candidates));
      this.log(`${evaluation} (${duration}ms)\n`);
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
