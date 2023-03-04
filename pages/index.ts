import { State, StateArray, StateAsync, StateAverage, StateDerived, StateNumber, StateObject, StateRepeater } from "../src"
import { StateClient, StateServer } from "./serverTest";


const createState = (val: number) => {
    let test = () => {
        return val;
    }
    let test2 = (val2: number) => {
        val = val2;
    }
    let test3 = (val2: number) => {
        val = val2;
    }
    return {
        test,
        test2,
        test3,
    }
}

class test {
    private _val;
    constructor(val: number) {
        this._val = val;
    }

    get() { return this._val; }

    set(val2: number) { this._val = val2; }
}

let yo: {}[] = []
window.yo = yo;

for (let i = 0; i < 1000000; i++) {
    yo[i] = createState(1);
    // yo[i] = new test(1);
    // yo[i] = new State(1);
}