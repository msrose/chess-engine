const {gameLoop, makeBoard, makeEngine} = require('./utils');

const board = makeBoard();
const engine1 = makeEngine(board, { verbose: true });
const engine2 = makeEngine(board, { verbose: true });

gameLoop(board, { white: engine1, black: engine2 });
