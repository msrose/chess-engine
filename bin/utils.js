const readline = require('readline');
const Engine = require('../src/engine');
const Board = require('../src/board');

function checkGameOver(board) {
  if (board.isGameOver()) {
    board.print();
    console.log(board.getResult())
    process.exit(0);
  }
}

function gameLoop(board, { white, black }) {
  setTimeout(async () => {
    board.print();
    console.log("===================");
    try {
      if (board.isWhiteToMove()) {
        const move = await white();
        console.log(move);
        checkGameOver(board);
        board.print();
      }
      if (board.isBlackToMove()) {
        const move = await black();
        console.log(move);
        checkGameOver(board);
      }
    } catch (e) {
      console.log(e);
    }
    gameLoop(board, { white, black });
  });
}

function makeBoard() {
  return new Board();
}

function makePlayer(board) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return () =>
    new Promise((resolve, reject) => {
      rl.question("Enter move: ", answer => {
        try {
          resolve(board.move(answer.trim()));
        } catch (e) {
          reject(e);
        }
      });
    });
}

function makeEngine(board) {
  const engine = new Engine();
  return () => engine.move(board);
}

module.exports = {
  gameLoop,
  makeBoard,
  makePlayer,
  makeEngine
};
