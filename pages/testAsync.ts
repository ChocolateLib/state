import { createStateAsync } from "../src";

export const createTestAsync = () => {
    let value: number = 0;
    setInterval(() => { value++ }, 500);
    return createStateAsync<number | undefined, number>(async (state) => {
        console.warn('Async Test Once Called');
        await new Promise((a) => { setTimeout(a, 500) });
        state.setFulfillment(value);
    }, () => { }, () => { })
}

let calls: (() => void)[] = [];
setInterval(() => {
    for (let i = 0; i < calls.length; i++) {
        calls[i]();
    }
}, 250);
export const createTestAsyncLive = () => {
    let value: number = 0;
    let call: () => void
    setInterval(() => { value++ }, 500);
    return createStateAsync<number | undefined, number>(async (state) => {
        console.warn('Async Test Once Called');
        await new Promise((a) => { setTimeout(a, 500) });
        state.setFulfillment(value);
    }, async (state) => {
        console.warn('Async Test Setup Called');
        await new Promise((a) => { setTimeout(a, 500) });
        call = () => {
            state.setLiveValue(value, true);
        }
        calls.push(call);
    }, async (state) => {
        console.warn('Async Test Teardown Called');
        const index = calls.indexOf(call);
        if (index != -1) {
            calls.splice(index, 1);
        }
    })
}