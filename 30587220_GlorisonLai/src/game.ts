/**
 * Game defines state and entity logic
 */

import { COLUMNS, ROWS } from "./constants";
import { Key } from "./controller";

// TILEKEYS is the set of tiles controllable by the player
const TILEKEYS = ["T", "I", "O", "J", "L", "S", "Z", "None"] as const;

// TILESHAPES is a global object storing the shapes and rotations of the tiles
export const TILESHAPES: { [key in TileKey]: number[][][] } = {
  T: [
    [
      [0, 0, 0],
      [0, 1, 0],
      [1, 1, 1],
    ],
    [
      [0, 1, 0],
      [0, 1, 1],
      [0, 1, 0],
    ],
    [
      [0, 0, 0],
      [1, 1, 1],
      [0, 1, 0],
    ],
    [
      [0, 1, 0],
      [1, 1, 0],
      [0, 1, 0],
    ],
  ],
  I: [
    [
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
    ],
    [
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
  ],
  O: [
    [
      [1, 1],
      [1, 1],
    ],
  ],
  J: [
    [
      [0, 1, 0],
      [0, 1, 0],
      [1, 1, 0],
    ],
    [
      [0, 0, 0],
      [1, 0, 0],
      [1, 1, 1],
    ],
    [
      [0, 1, 1],
      [0, 1, 0],
      [0, 1, 0],
    ],
    [
      [0, 0, 0],
      [1, 1, 1],
      [0, 0, 1],
    ],
  ],
  L: [
    [
      [0, 1, 0],
      [0, 1, 0],
      [1, 1, 0],
    ],
    [
      [0, 0, 0],
      [1, 0, 0],
      [1, 1, 1],
    ],
    [
      [0, 1, 1],
      [0, 1, 0],
      [0, 1, 0],
    ],
    [
      [0, 0, 0],
      [1, 1, 1],
      [0, 0, 1],
    ],
  ],
  S: [
    [
      [0, 0, 0],
      [0, 1, 1],
      [1, 1, 0],
    ],
    [
      [0, 1, 0],
      [0, 1, 1],
      [0, 0, 1],
    ],
  ],
  Z: [
    [
      [0, 0, 0],
      [1, 1, 0],
      [0, 1, 1],
    ],
    [
      [0, 0, 1],
      [0, 1, 1],
      [0, 1, 0],
    ],
  ],
  None: [[]],
};

// TileKey is the union type of the elements in TILEKEYS
export type TileKey = (typeof TILEKEYS)[number];

// TilePos describes a tile
export type TilePos = Readonly<{
  // tile is the ID in TILEKEYS
  tile: TileKey;
  // rotation index for TILESHAPE
  rotation: number;
  // x,y is the coordinate of the tile on the board
  x: number;
  y: number;
}>;

// Board holds the placed blocks
type Board = TileKey[][];

/** State processing */

// Main Tetris state
export type State = Readonly<{
  // speed is the ticks per automatic tile descent
  speed: number;
  // gameEnd is flag for Game Over
  gameEnd: boolean;
  // board hold the placed blocks
  board: Board;
  // preview holds the next player tile
  preview: TilePos;
  // current is the current controllable tile
  current: TilePos;
  // score of the player
  score: number;
  // highScore of the player amongst past games
  highScore: number;
}>;

// Randomly chooses random tile ID
const generateRandomTile = (): TileKey => {
  // Ignore "None"
  const validTileIndex = TILEKEYS.length - 1;

  const index = Math.floor(Math.random() * validTileIndex);

  return TILEKEYS[index];
};

// Create new tile object
const instantiateTile = (): TilePos => ({
  tile: generateRandomTile(),
  rotation: 0,
  x: Math.floor(COLUMNS / 2),
  y: 0,
});

export const rotateTile = (tile: TilePos): TilePos => {
  return {
    ...tile,
    rotation: (tile.rotation + 1) % TILESHAPES[tile.tile].length,
  };
};

export const moveTile = (tile: TilePos, dx: number, dy: number): TilePos => ({
  ...tile,
  x: tile.x + dx,
  y: tile.y + dy,
});

export const getTileShape = (tile: TilePos): readonly number[][] =>
  TILESHAPES[tile.tile][tile.rotation];

export const initialState = (highScore: number) =>  ({
  speed: 10,
  gameEnd: false,
  board: Array(ROWS).fill(Array(COLUMNS).fill("None")),
  preview: instantiateTile(),
  current: instantiateTile(),
  score: 0,
  highScore,
});

// clearRow removes filled rows, and increments player score
const clearRow = (s: State) => {
  const board = s.board;
  const clearedBoard = board.filter((row) => row.some((e) => e === "None"));
  const rowsCleared = board.length - clearedBoard.length;

  return {
    ...s,
    board: clearedBoard.concat(
      Array(rowsCleared).fill(Array(COLUMNS).fill("None")),
    ),
    score: s.score + rowsCleared,
  };
};

// checks whether current tile is in board, and does not overlap placed blocks
const checkIsValidMovement = (s: State, tile: TilePos) => {
  const tileShape = getTileShape(tile);

  const isFree = tileShape.every((row, y) => {
    return row.every((block, x) => {
      // if no block, ignore checks
      if (block === 0) return true;

      const boardY = y + tile.y;
      const boardX = x + tile.x;

      // check tile block is in board
      if (
        boardY < 0||
        boardX < 0  || 
        boardY >= ROWS ||
        boardX >= COLUMNS
      ) return false

      const boardBlock = s.board[boardY][boardX];

      // check board is free
      return boardBlock === "None";
    });
  });

  return isFree;
};

// places current player tile onto board, and make preview current tile
const placeTile = (s: State) => ({
  ...s,
  board: s.board.map((row, y) => {
    const shape = getTileShape(s.current);

    if (y < s.current.y || y > s.current.y + shape.length) return row;

    return row.map((tile, x) => {
      const isOccupied =
        shape[y - s.current.y] && shape[y - s.current.y][x - s.current.x];
      return isOccupied ? s.current.tile : tile;
    });
  }),
  current: s.preview,
  preview: instantiateTile(),
});

// maps player keypress into movement
const getMovement = (key: Key) => {
  switch (key) {
    case "KeyA":
      return (tile: TilePos) => moveTile(tile, -1, 0);
    case "KeyD":
      return (tile: TilePos) => moveTile(tile, 1, 0);
    case "KeyS":
      return (tile: TilePos) => moveTile(tile, 0, 1);
    case "Space":
      return (tile: TilePos) => rotateTile(tile);
    default:
      return (tile: TilePos) => moveTile(tile, 0, 0);
  }
};

/**
 * Updates the state by proceeding with one time step.
 *
 * @param s Current state
 * @returns Updated state
 */
export const tick = (s: State, [tick, key]: [number, Key]) => {
  // on Game Over, reset game on keypress
  if (s.gameEnd && key !== "None") return initialState(s.highScore);

  // on Game Over, continue current screen
  if (s.gameEnd) return s;

  // get player movement
  const movement = getMovement(key);

  const { current, speed } = s;

  // next potential state with automatic descent
  const next = tick % speed === 0 ? moveTile(current, 0, 1) : current;

  // next potential state with player movement
  const playerNext = movement(next);

  // Check player movement
  const newState = checkIsValidMovement(s, playerNext)
    ? {
      ...s,
      current: playerNext,
    }
    // Check Automatic Movement
    : checkIsValidMovement(s, next)
      ? {
        ...s,
        current: next,
      }
      // Check if Game Over
      : current.y === 0
        ? {
          ...s,
          gameEnd: true,
          highScore: Math.max(s.highScore, s.score),
        }
        // If Automatic Movement is invalid, place tile onto board
        : placeTile(s);

  // Check for any filled rows
  const clearedState = clearRow(newState);

  // Update game speed if enough rows filled
  return {
    ...clearedState,
    speed: Math.max(5, 10 - Math.floor(clearedState.score / 10)),
  };
};
