import { State, StateAsync, StateDerived, StateNumber, StateRepeater } from "../src"

let state = new StateNumber(5, { min: 2, max: 5 });
console.warn(state.min)