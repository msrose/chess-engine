const {gameLoop, makeBoard, makePlayer, makeEngine} = require('./utils');

const board = makeBoard();
const player = makePlayer(board);
const engine = makeEngine(board);

gameLoop(board, { white: player, black: engine });
