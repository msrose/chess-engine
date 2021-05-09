const readline = require('readline');
const Board = require('./board');
const Engine = require('./engine');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const board = new Board();
const engine = new Engine();

// To have engine play white
// board.print();
// engine.move(board);

(function handleMove() {
  board.print();
  console.log("===================");
  rl.question("Enter moves: ", answer => {
    try {
      answer.split(" ").filter(Boolean).forEach(move => {
        board.move(move);
        // To have engine play itself
        // engine.move(board);
        if (board.isGameOver()) {
          board.print();
          console.log(board.getResult())
          process.exit(0);
        }
      });
      board.print();
      engine.move(board);
      if (board.isGameOver()) {
        board.print();
        console.log(board.getResult())
        process.exit(0);
      }
    } catch (e) {
      console.log(e);
    }
    handleMove();
  });
})();
