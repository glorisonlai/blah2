/**
 * Game defines state and entity logic
 */

import { COLUMNS, ROWS } from "./constants";

const TILEKEYS = ["T", "I", "O", "J", "L", "S", "Z", "None"] as const;

const TILESET: { [key in TileKey]: number } = {
  T: 1,
  I: 2,
  O: 3,
  J: 4,
  L: 5,
  S: 6,
  Z: 7,
  None: 0,
};

export const TILESHAPES: { [key in TileKey]: number[][][] } = {
  T: [
    [
      [1, 1, 1],
      [0, 1, 0],
      [0, 0, 0],
    ],
    [
      [0, 1, 0],
      [1, 1, 0],
      [0, 1, 0],
    ],
    [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    [
      [0, 1, 0],
      [0, 1, 1],
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
      [0, 1, 1],
      [0, 1, 0],
      [0, 1, 0],
    ],
    [
      [1, 1, 1],
      [0, 0, 1],
      [0, 0, 0],
    ],
    [
      [0, 1, 0],
      [0, 1, 0],
      [1, 1, 0],
    ],
    [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
  ],
  L: [
    [
      [1, 1, 0],
      [0, 1, 0],
      [0, 1, 0],
    ],
    [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    [
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 1],
    ],
    [
      [1, 1, 1],
      [1, 0, 0],
      [0, 0, 0],
    ],
  ],
  S: [
    [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    [
      [0, 1, 0],
      [0, 1, 1],
      [0, 0, 1],
    ],
  ],
  Z: [
    [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    [
      [0, 0, 1],
      [0, 1, 1],
      [0, 1, 0],
    ],
  ],
  None: [[]],
};

type TileKey = (typeof TILEKEYS)[number];

export type TileId = (typeof TILESET)[keyof typeof TILESET];

type TilePos = Readonly<{
  tile: TileKey;
  rotation: number;
  x: number;
  y: number;
}>;

type Board = TileId[][];

/** State processing */

export type State = Readonly<{
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

export const rotateTile = (tile: TilePos): TilePos => ({
  ...tile,
  rotation: (tile.rotation + 1) % tile.tile.length,
});

export const moveTile = (tile: TilePos, dx: number, dy: number): TilePos => ({
  ...tile,
  x: tile.x + dx,
  y: tile.y + dy,
});

const tileShape = (tile: TilePos): readonly number[][] =>
  TILESHAPES[tile.tile][tile.rotation];

export const initialState: State = {
  gameEnd: false,
  board: Array(ROWS).fill(Array(COLUMNS).fill(TILESET.None)),
  preview: instantiateTile(),
  current: instantiateTile(),
  score: 0,
} as const;

/**
 * Updates the state by proceeding with one time step.
 *
 * @param s Current state
 * @returns Updated state
 */
const tick = (s: State, [tick]) => {
  const { current, board } = s;
  const next = moveTile(current, 0, 1);
  const nextShape = tileShape(next);

  const nextBoard = board.map((row, y) =>
    row.map((tile, x) => {
      const isOccupied =
        nextShape[y - next.y] && nextShape[y - next.y][x - next.x];
      return isOccupied ? TILESET[next.tile] : tile;
    }),
  );

  return {
    ...s,
    board: nextBoard,
    current: next,
  };
};
