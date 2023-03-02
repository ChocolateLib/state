/// <reference types="cypress" />
import { StateAsync } from "../../src"

describe('Initial state', function () {
    it('Async get without delay', async function () {
        let state = new StateAsync(() => { }, () => { }, () => {
            state.setAsync = 10;
        }, () => { });
        expect(await state.get).equal(10);
    });
    it('Async get with delay', async function () {
        let state = new StateAsync(() => { }, () => { }, async () => {
            await new Promise((a) => { setTimeout(a, 10) });
            state.setAsync = 10;
        }, () => { });
        expect(await state.get).equal(10);
    });
    it('Async subscriber', function (done) {
        let value = 0
        let interval: any;
        let state = new StateAsync<number>(() => { interval = setInterval(() => { state.setAsync = value++ }) }, () => { }, () => { }, () => { });
        let count = 0;
        state.subscribe((val) => {
            expect(val).equal(value - 1);
            if (count++ > 10) {
                clearInterval(interval);
                done()
            }
        })
    });
    it('Async unsubscriber', function (done) {
        let value = 0
        let interval: any;
        let state = new StateAsync<number>(() => { interval = setInterval(() => { state.setAsync = value++ }) }, () => { clearInterval(interval); done() }, () => { }, () => { });
        let count = 0;
        let func = state.subscribe((val) => {
            expect(val).equal(value - 1);
            if (count++ > 10) {
                state.unsubscribe(func);
            }
        })
    });
});