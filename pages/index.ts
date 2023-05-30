import { State, StateNumberLimits } from "../src";

let yo: StateNumberLimits[] = []
declare global {
    interface Window { yo: any; }
}
window.yo = yo;

console.log(new State(1));
