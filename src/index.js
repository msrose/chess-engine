const readline = require('readline');
const Board = require('./board');

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