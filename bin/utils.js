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

async function handleMove(board, handler) {
  const move = await handler();
  console.log(move);
  checkGameOver(board);
}

function gameLoop(board, { white, black }) {
  setTimeout(async () => {
    board.print();
    console.log("===================");
    try {
      if (board.isWhiteToMove()) {
        await handleMove(board, white);
        board.print();
      }
      if (board.isBlackToMove()) {
        await handleMove(board, black);
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

function makeEngine(board, options) {
  const engine = new Engine(options);
  return () => engine.move(board);
}

module.exports = {
  gameLoop,
  makeBoard,
  makePlayer,
  makeEngine
};
