import { State, StateAsync, StateDerived } from "../src"

let calls: (() => void)[] = [];
setInterval(() => {
    for (let i = 0; i < calls.length; i++) {
        calls[i]();
    }
});
class AsyncTest extends StateAsync<number> {
    private value: number = 0;
    private interval: any;
    constructor() {
        setInterval(() => { this.value++ }, 500);
        super(async () => {
            await new Promise((a) => { setTimeout(a, 500) });
            calls.push(() => {
                this.setAsync = this.value;
            })
        }, async () => {
            clearInterval(this.interval);
        }, async (state) => {
            await new Promise((a) => { setTimeout(a, 500) });
            this.setAsync = this.value;
        }, async (val) => {
            await new Promise((a) => { setTimeout(a, 500) });
            this.value = val;
        });
    }
}


let values = [new State(1), new State(2), new State(3)];
let multi = new StateDerived((values) => { return values.reduce((accumulator, element) => accumulator + element, 0); }, values);
multi.subscribe((val) => {
    console.warn(val);
});
values[0].set = 2;
values[1].set = 3;
values[2].set = 4;

let values2 = [new AsyncTest(), new State(1), new AsyncTest()];
let multi2 = new StateDerived((values) => { return values.reduce((accumulator, element) => accumulator + element, 0); }, values2);
multi2.subscribe((val) => {
    console.warn(val);
});