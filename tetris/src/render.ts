/**
 * Render draws sprites to the canvas.
 */

import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  COLUMNS,
  PREVIEW_HEIGHT,
  PREVIEW_WIDTH,
  ROWS,
} from "./constants";
import { State, TILESHAPES, TileKey, TilePos, getTileShape } from "./game";

const Block = {
  WIDTH: CANVAS_WIDTH / COLUMNS,
  HEIGHT: CANVAS_HEIGHT / ROWS,
};

type CanvasElements = {
  canvas: HTMLCanvasElement;
  preview: HTMLCanvasElement;
  gameOver: HTMLElement;
  container: HTMLElement;
  levelText: HTMLElement;
  scoreText: HTMLElement;
  highScoreText: HTMLElement;
};

const getCanvasElements = (): CanvasElements => {
  // Canvas elements
  const canvas = document.querySelector("#svgCanvas") as HTMLCanvasElement;
  const preview = document.querySelector("#svgPreview") as HTMLCanvasElement;
  const gameOver = document.querySelector("#gameOver") as SVGGraphicsElement &
    HTMLElement;
  const container = document.querySelector("#main") as HTMLElement;
  //
  // Text fields
  const levelText = document.querySelector("#levelText") as HTMLElement;
  const scoreText = document.querySelector("#scoreText") as HTMLElement;
  const highScoreText = document.querySelector("#highScoreText") as HTMLElement;

  return {
    canvas,
    preview,
    gameOver,
    container,
    levelText,
    scoreText,
    highScoreText,
  };
};

const instantiateCanvas = (canvasEls: CanvasElements, highScore = 0) => {
  const { canvas, preview, levelText, scoreText, highScoreText, gameOver } =
    canvasEls;

  canvas.setAttribute("height", `${CANVAS_HEIGHT}`);
  canvas.setAttribute("width", `${CANVAS_WIDTH}`);
  preview.setAttribute("height", `${PREVIEW_HEIGHT}`);
  preview.setAttribute("width", `${PREVIEW_WIDTH}`);

  levelText.innerHTML = "1";
  scoreText.innerHTML = "0";
  highScoreText.innerHTML = highScore.toString();

  hide(gameOver);
};

/**
 * Displays a SVG element on the canvas. Brings to foreground.
 * @param elem SVG element to display
 */
const show = (elem: HTMLElement) => {
  elem.setAttribute("visibility", "visible");
  elem.parentNode!.appendChild(elem);
};

/**
 * Hides a SVG element on the canvas.
 * @param elem SVG element to hide
 */
const hide = (elem: HTMLElement) => elem.setAttribute("visibility", "hidden");

/**
 * Creates an SVG element with the given properties.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/SVG/Element for valid
 * element names and properties.
 *
 * @param namespace Namespace of the SVG element
 * @param name SVGElement name
 * @param props Properties to set on the SVG element
 * @returns SVG element
 */
const createSvgElement = (
  namespace: string | null,
  name: string,
  props: Record<string, string> = {},
) => {
  const elem = document.createElementNS(namespace, name) as SVGElement;
  Object.entries(props).forEach(([k, v]) => elem.setAttribute(k, v));
  return elem;
};

const createBlock = (
  ctx: CanvasRenderingContext2D,
  id: TileKey,
  x: number,
  y: number,
) => {
  const blockColours: { [id in TileKey]: string } = {
    T: "green",
    I: "red",
    O: "blue",
    J: "yellow",
    L: "purple",
    S: "orange",
    Z: "cyan",
    None: "none",
  };

  ctx.fillStyle = blockColours[id];
  ctx.fillRect(x, y, Block.WIDTH, Block.HEIGHT);
};

const createTile = (ctx: CanvasRenderingContext2D, tilePos: TilePos) => {
  const { x, y, tile } = tilePos;
  console.log(tilePos.rotation);
  const shape = getTileShape(tilePos);
  const length = shape.length;

  shape.flat().map((block, i) => {
    if (block === 0) return null;

    const blockX = (x + (i % length)) * Block.WIDTH;
    const blockY = (y + Math.floor(i / length)) * Block.HEIGHT;

    createBlock(ctx, tile, blockX, blockY);
  });
};

/**
 * Renders the current state to the canvas.
 *
 * In MVC terms, this updates the View using the Model.
 *
 * @param s Current state
 */
const render = (s: State, canvasEls: CanvasElements) => {
  const { canvas, preview, gameOver } = canvasEls;

  const context = canvas.getContext("2d")!;
  context?.clearRect(0, 0, canvas.width, canvas.height);

  const previewContext = preview.getContext("2d")!;
  previewContext?.clearRect(0, 0, preview.width, preview.height);

  // Add blocks to the main grid canvas
  s.board.forEach((row, y) => {
    row.forEach((blockId, x) => {
      if (blockId === "None") return;

      createBlock(context, blockId, x * Block.WIDTH, y * Block.HEIGHT);
    });
  });

  // Add current block to canvas
  createTile(context, s.current);

  // Add a block to the preview canvas
  createTile(previewContext, s.preview);

  console.log(s);
  if (s.gameEnd) {
    console.log("hello");
    show(gameOver);
  } else {
    hide(gameOver);
  }
};

export { getCanvasElements, instantiateCanvas, render };
