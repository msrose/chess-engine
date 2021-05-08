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

module.exports = Square;
