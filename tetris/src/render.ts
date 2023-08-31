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
import { State } from "./game";

const Block = {
  WIDTH: CANVAS_WIDTH / COLUMNS,
  HEIGHT: CANVAS_HEIGHT / ROWS,
};

type CanvasElements = {
  canvas: HTMLElement;
  preview: HTMLElement;
  gameOver: HTMLElement;
  container: HTMLElement;
  levelText: HTMLElement;
  scoreText: HTMLElement;
  highScoreText: HTMLElement;
};

const getCanvasElements = (): CanvasElements => {
  // Canvas elements
  const canvas = document.querySelector("#svgCanvas") as SVGGraphicsElement &
    HTMLElement;
  const preview = document.querySelector("#svgPreview") as SVGGraphicsElement &
    HTMLElement;
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

/**
 * Renders the current state to the canvas.
 *
 * In MVC terms, this updates the View using the Model.
 *
 * @param s Current state
 */
const render = (s: State, canvasEls: CanvasElements) => {
  const { canvas, preview, gameOver } = canvasEls;
  //
  // Add blocks to the main grid canvas
  const cube = createSvgElement(canvas.namespaceURI, "rect", {
    height: `${Block.HEIGHT}`,
    width: `${Block.WIDTH}`,
    x: "0",
    y: "0",
    style: "fill: green",
  });
  canvas.appendChild(cube);
  const cube2 = createSvgElement(canvas.namespaceURI, "rect", {
    height: `${Block.HEIGHT}`,
    width: `${Block.WIDTH}`,
    x: `${Block.WIDTH * (3 - 1)}`,
    y: `${Block.HEIGHT * (20 - 1)}`,
    style: "fill: red",
  });
  canvas.appendChild(cube2);
  const cube3 = createSvgElement(canvas.namespaceURI, "rect", {
    height: `${Block.HEIGHT}`,
    width: `${Block.WIDTH}`,
    x: `${Block.WIDTH * (4 - 1)}`,
    y: `${Block.HEIGHT * (20 - 1)}`,
    style: "fill: red",
  });
  canvas.appendChild(cube3);

  // Add a block to the preview canvas
  const cubePreview = createSvgElement(preview.namespaceURI, "rect", {
    height: `${Block.HEIGHT}`,
    width: `${Block.WIDTH}`,
    x: `${Block.WIDTH * 2}`,
    y: `${Block.HEIGHT}`,
    style: "fill: green",
  });
  preview.appendChild(cubePreview);

  if (s.gameEnd) {
    show(gameOver);
  } else {
    hide(gameOver);
  }
};

export { getCanvasElements, instantiateCanvas, render };
