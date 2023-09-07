/** User input */
import { fromEvent, interval, merge } from "rxjs";
import {
  map,
  filter,
  scan,
  takeUntil,
  repeat,
  startWith,
} from "rxjs/operators";
import { TilePos, moveTile, rotateTile } from "./game";

export type Key = "KeyS" | "KeyA" | "KeyD" | "Space" | "None";

type Event = "keydown" | "keyup" | "keypress";

// Keyboard event stream
export const keyPress$ = fromEvent<KeyboardEvent>(document, "keydown").pipe(
  takeUntil(fromEvent(document, "keyup")),
  repeat(),
);

const key$ = fromEvent<KeyboardEvent>(document, "keypress");

// Filters keypress events for keyCode
const fromKey = (keyCode: Key) =>
  key$.pipe(filter(({ code }) => code === keyCode));

const left$ = fromKey("KeyA").pipe(map(() => "KeyA"));
const right$ = fromKey("KeyD").pipe(map(() => "KeyD"));
const down$ = fromKey("KeyS").pipe(map(() => "KeyS"));
const space$ = fromKey("Space").pipe(map(() => "Space"));

// keypress stream until player lifts key
export const input$ = merge(left$, right$, down$, space$).pipe(
  startWith("None"),
  takeUntil(fromEvent(document, "keyup")),
  repeat(),
);
