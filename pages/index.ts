import { State, StateArray, StateAsync, StateAverage, StateDerived, StateNumber, StateObject, StateRepeater } from "../src"

let calls: (() => void)[] = [];
setInterval(() => {
    for (let i = 0; i < calls.length; i++) {
        calls[i]();
    }
});
export class AsyncTest extends StateAsync<number> {
    private value: number = 0;
    private interval: any;
    constructor() {
        setInterval(() => { this.value++ }, 500);
        super(async () => {
            await new Promise((a) => { setTimeout(a, 500) });
            calls.push(() => {
                this.asyncFulfill = this.value;
            })
        }, async () => {
            clearInterval(this.interval);
        }, async (state) => {
            await new Promise((a) => { setTimeout(a, 500) });
            this.asyncReject = new Error('yo');
        }, async (val) => {
            await new Promise((a) => { setTimeout(a, 500) });
            this.value = val;
        });
    }
}


let asdf = new StateObject({ asdf: 1, vvv: 2 })

for (const iterator of asdf) {
    console.warn(iterator);
}

let asdf2 = new StateArray([1, 2, 3])

for (const iterator of asdf2) {
    console.warn(iterator);
}