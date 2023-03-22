/// <reference types="cypress" />
import { StateAsync } from "../../src";
import { createTestAsync } from "./testAsync"

const generatePromises = (amount: number) => {
    let promises: Promise<any>[] = [];
    let fulfillments: ((value: any) => void)[] = [];
    for (let i = 0; i < amount; i++) {
        promises.push(new Promise<any>((a) => { fulfillments.push(a); }))
    }
    return {
        promise: new Promise(async (a) => {
            a(await Promise.all(promises));
        }),
        calls: fulfillments
    }
}

describe('Getting state value', async function () {
    it('Async once fulfillment', async function () {
        let { promise, calls } = generatePromises(2)
        let state = new StateAsync<number>(
            (state) => {
                calls[0](0);
                state.setFulfillment(0);
            }
            , () => { throw new Error('This should not be called'); }
            , () => { throw new Error('This should not be called'); }
            , () => { throw new Error('This should not be called'); });
        state.then(() => { calls[1](0); }, () => { throw new Error('This should not be called'); });
        await promise;
    });
    it('Async once rejection', async function () {
        let { promise, calls } = generatePromises(2)
        let state = new StateAsync<number>(
            (state) => {
                calls[0](0);
                state.setRejection('Yo');
            }
            , () => { throw new Error('This should not be called'); }
            , () => { throw new Error('This should not be called'); }
            , () => { throw new Error('This should not be called'); });
        state.then(() => { throw new Error('This should not be called'); }, () => { calls[1](0); });
        await promise;
    });
    it('Using then with chaining return', function (done) {
        let state = new StateAsync<number>((state) => { state.setFulfillment(2); }, () => { throw new Error('This should not be called'); }, () => { throw new Error('This should not be called'); }, () => { throw new Error('This should not be called'); });
        state.then((val) => {
            expect(val).equal(2);
            return 8;
        }).then((val) => {
            expect(val).equal(8);
            done()
        })
    });
    it('Using then with chaining throw', function (done) {
        let state = new StateAsync<number>((state) => { state.setFulfillment(2); }, () => { throw new Error('This should not be called'); }, () => { throw new Error('This should not be called'); }, () => { throw new Error('This should not be called'); });
        state.then((val) => {
            expect(val).equal(2);
            throw 8;
        }).then(() => { }, (val) => {
            expect(val).equal(8);
            done()
        })
    });
    it('Using then with async chaining return', function (done) {
        let state = new StateAsync<number>((state) => { state.setFulfillment(2); }, () => { throw new Error('This should not be called'); }, () => { throw new Error('This should not be called'); }, () => { throw new Error('This should not be called'); });
        state.then(async (val) => {
            await new Promise((a) => { setTimeout(a, 10) });
            expect(val).equal(2);
            return 8;
        }).then((val) => {
            expect(val).equal(8);
            done()
        })
    });
    it('Using then with async chaining throw', function (done) {
        let state = new StateAsync<number>((state) => { state.setFulfillment(2); }, () => { throw new Error('This should not be called'); }, () => { throw new Error('This should not be called'); }, () => { throw new Error('This should not be called'); });
        state.then(async (val) => {
            await new Promise((a) => { setTimeout(a, 10) });
            expect(val).equal(2);
            throw 8;
        }).then(() => { }, (val) => {
            expect(val).equal(8);
            done()
        })
    });
    it('Awaiting async value', async function () {
        let state = createTestAsync();
        expect(await state).equal(1);
    });
});

describe('Async Setting value', function () {
    it('From user context with no setter function', async function (done) {
        let state = new StateAsync<number>(
            () => { throw new Error('This should not be called'); },
            () => { throw new Error('This should not be called'); },
            () => { throw new Error('This should not be called'); },
            () => { done() });
        state.write(4)
    });
});

describe('Async subscribe', function () {
    it('Async subscribe', async function () {
        let { promise, calls } = generatePromises(3)
        let state = new StateAsync<number>(() => { throw new Error('This should not be called'); }
            , (state) => {
                calls[0](0);
                state.setLiveValue(0)
            }
            , () => { throw new Error('This should not be called'); }
            , () => { throw new Error('This should not be called'); });
        state.subscribe(() => { calls[1](0); }, true);
        state.subscribe(() => { calls[2](0); }, true);
        await promise;
    });
    it('Async unsubscribe', async function () {
        let { promise, calls } = generatePromises(3)
        let state = new StateAsync<number>(() => { throw new Error('This should not be called'); }
            , (state) => {
                calls[0](0);
                state.setLiveValue(0)
            }
            , () => { calls[2](0); }
            , () => { throw new Error('This should not be called'); });
        let func = state.subscribe(() => { calls[1](0); });
        state.unsubscribe(func);
        await promise;
    });
    it('Subscribing to async value', async function () {
        let func
        let state = createTestAsync();
        let value = await new Promise((a) => { func = state.subscribe(a); })
        expect(value).equal(1);
        state.unsubscribe(func)
    });
});