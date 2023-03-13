import { createState, createStateAsync, createStateAverager, createStateDerived } from "../src";
import { createDocumentHandler } from "./document";
import { createThemeEngine } from "./theme";

let { handler } = createDocumentHandler(document);
let { engine } = createThemeEngine(handler);

let { state: state1 } = createState(1);
let { state: state2 } = createState(2);
let { state: state3 } = createState(3);
let { derived, setStates } = createStateDerived((values) => { return values[0] }, state1, state2, state3);
derived.subscribe((value) => {
    console.warn(value);
});