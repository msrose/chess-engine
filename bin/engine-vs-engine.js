const {gameLoop, makeBoard, makeEngine} = require('./utils');

const board = makeBoard();
const engine1 = makeEngine(board);
const engine2 = makeEngine(board);

gameLoop(board, { white: engine1, black: engine2 });
