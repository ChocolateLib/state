import { State, StateAsync, StateDerived, StateNumber, StateRepeater } from "../src"

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

let s1 = new State(1);
console.warn(JSON.stringify(s1));


// let test = new StateDerived((values) => {
//     return values[0] + values[1] + values[2];
// }, [s1, s2, s3])

// let test2 = (<Promise<number>>(test.get)).then((val) => {
//     console.warn('ya0', val);
// }, (val) => {
//     console.warn('yo0', val);
// })






// let async = new AsyncTest;
// async.then((val) => {
//     console.warn('ya0', val);
//     throw new Error
//     return 6
// }, (val) => {
//     console.warn('yo0', val);
//     return 6
// }).then((val) => {
//     console.warn('ya1', val);
//     return 3
// }, (val) => {
//     console.warn('yo1', val);
//     throw new Error
//     return 5
// }).then((val) => {
//     console.warn('ya2', val);
//     return 3
// }, (val) => {
//     console.warn('yo2', val);
//     return 5
// })


// let test2 = new State(1);
// test2.then((val) => {
//     console.warn(val);
//     return 2
// }).then((val) => {
//     console.warn(val);
//     throw new Error()
// }).then((val) => {
//     console.warn(val);
//     return 4
// }, (val) => {
//     console.warn(val);
// })

// let test = new Promise<number>((a) => { setTimeout(a, 200, 1) });
// test.then((val) => {
//     console.warn(val);
//     throw new Error
//     return 6
// }).then((val) => {
//     console.warn('ya', val);
//     return 3
// }, (val) => {
//     console.warn('yo', val);
//     throw new Error
//     return 5
// }).then((val) => {
//     console.warn('ya2', val);
//     return 3
// }, (val) => {
//     console.warn('yo2', val);
//     return 5
// })

