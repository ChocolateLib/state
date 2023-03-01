import { StateAsync } from "../../src";

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