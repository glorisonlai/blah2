/**
 * Inside this file you will use the classes and functions from rx.js
 * to add visuals to the svg element in index.html, animate them, and make them interactive.
 *
 * Study and complete the tasks in observable exercises first to get ideas.
 *
 * Course Notes showing Asteroids in FRP: https://tgdwyer.github.io/asteroids/
 *
 * You will be marked on your functional programming style
 * as well as the functionality that you implement.
 *
 * Document your code!
 */

import "./style.css";

import { interval, merge } from "rxjs";
import { map, filter, scan } from "rxjs/operators";
import { getCanvasElements, instantiateCanvas, render } from "./render";
import { State, initialState } from "./game";
import { TICK_RATE_MS } from "./constants";

/**
 * This is the function called on page load. Your main game loop
 * should be called here.
 */
export function main(highScore: number) {
  const canvasEls = getCanvasElements();

  instantiateCanvas(canvasEls, highScore);

  /** Observables */

  /** Determines the rate of time steps */
  const tick$ = interval(TICK_RATE_MS);

  const source$ = merge(tick$)
    .pipe(scan((s: State) => ({ ...s, gameEnd: true }), initialState))
    .subscribe((s: State) => {
      render(s, canvasEls);
    });
}

// The following simply runs your main function on window load.  Make sure to leave it in place.
if (typeof window !== "undefined") {
  window.onload = () => {
    main(0);
  };
}
