import { State, StateNumber, StateNumberLimits } from "../src";

let yo: StateNumberLimits[] = []
declare global {
    interface Window { yo: any; }
}
window.yo = yo;