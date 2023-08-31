/** User input */
import { fromEvent, interval, merge } from "rxjs";
import { map, filter, scan } from "rxjs/operators";

type Key = "KeyS" | "KeyA" | "KeyD" | "Space";

type Event = "keydown" | "keyup" | "keypress";

const key$ = fromEvent<KeyboardEvent>(document, "keypress");

const fromKey = (keyCode: Key) =>
  key$.pipe(filter(({ code }) => code === keyCode));

const left$ = fromKey("KeyA");
const right$ = fromKey("KeyD");
const down$ = fromKey("KeyS");
const space$ = fromKey("Space");

export { left$, right$, down$, space$ };
