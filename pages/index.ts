import { createState, createStateAsync, createStateAverager, createStateDerived } from "../src";

let yo: any[] = []
declare global {
    interface Window { yo: any; }
}
window.yo = yo;

for (let i = 0; i < 1000; i++) {
    let state = createState(1, (val) => { state.set(val); });
    yo[i] = state;
}