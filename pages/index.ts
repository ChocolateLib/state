import { createState, createStateAsync, createStateAverager, createStateDerived, createStateSummer, StateRead } from "../src";

let yo: any[] = []
declare global {
    interface Window { yo: any; }
}
window.yo = yo;

for (let i = 0; i < 500000; i++) {
    let state = createStateSummer();
    yo[i] = state;
}
