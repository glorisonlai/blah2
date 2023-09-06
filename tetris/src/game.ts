/**
 * Game defines state and entity logic
 */

import { COLUMNS, ROWS } from "./constants";
import { Key } from "./controller";

// const TILEKEYS = ["T", "I", "O", "J", "L", "S", "Z", "None"] as const;
const TILEKEYS = ["I", "None"] as const;

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

export type TileKey = (typeof TILEKEYS)[number];

export type TilePos = Readonly<{
  tile: TileKey;
  rotation: number;
  x: number;
  y: number;
}>;

type Board = TileKey[][];

/** State processing */

export type State = Readonly<{
  speed: number;
  gameEnd: boolean;
  board: Board;
  preview: TilePos;
  current: TilePos;
  score: number;
}>;

const generateRandomTile = (): TileKey => {
  // Ignore "None"
  const validTileIndex = TILEKEYS.length - 1;

  const index = Math.floor(Math.random() * validTileIndex);

  return TILEKEYS[index];
};

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

export const initialState: State = {
  speed: 10,
  gameEnd: false,
  board: Array(ROWS).fill(Array(COLUMNS).fill("None")),
  preview: instantiateTile(),
  current: instantiateTile(),
  score: 0,
} as const;

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

const checkIsValidMovement = (s: State, tile: TilePos) => {
  const tileShape = getTileShape(tile);

  if (
    tile.y + tileShape.length > ROWS ||
    tile.x + tileShape.length > COLUMNS ||
    tile.x < 0 ||
    tile.y < 0
  ) {
    return false;
  }

  const isFree = tileShape.every((row, y) => {
    return row.every((block, x) => {
      if (block === 0) return true;

      const boardBlock = s.board[y + tile.y][x + tile.x];

      return boardBlock === "None";
    });
  });

  return isFree;
};

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
  if (s.gameEnd && key !== "None") return initialState;

  if (s.gameEnd) return s;

  const movement = getMovement(key);

  const { current, speed } = s;
  const next = tick % speed === 0 ? moveTile(current, 0, 1) : current;
  const playerNext = movement(next);

  const newState = checkIsValidMovement(s, playerNext)
    ? {
      ...s,
      current: playerNext,
    }
    : checkIsValidMovement(s, next)
      ? {
        ...s,
        current: next,
      }
      : current.y === 0
        ? {
          ...s,
          gameEnd: true,
        }
        : placeTile(s);

  const clearedState = clearRow(newState);
  console.log(tick, clearedState);

  return {
    ...clearedState,
    speed: Math.max(5, 10 - Math.floor(clearedState.score / 10)),
  };
};
