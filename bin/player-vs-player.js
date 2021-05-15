const {gameLoop, makeBoard, makePlayer} = require('./utils');

const board = makeBoard();
const player1 = makePlayer(board);
const player2 = makePlayer(board);

gameLoop(board, { white: player1, black: player2 });
