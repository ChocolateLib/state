/// <reference types="cypress" />
import { StateRepeater, State } from "../../src"
import { createTestAsync } from "./testAsync";

describe('Setup', function () {
    it('Repeater without params should have value undefined and read func', async function () {
        let repeater = new StateRepeater();
        expect(await repeater).equal(undefined);
    });
    it('Repeater with state should have states value', async function () {
        let state = new State(true);
        let repeater = new StateRepeater(state);
        expect(await repeater).equal(true);
    });
    it('Repeater with read func should change read func', async function () {
        let state = new State(10);
        let repeater = new StateRepeater(state, val => val * 10);
        expect(await repeater).equal(100);
    });
});

describe('Subscribers', function () {
    it('Adding subscriber to ValueRepeater without a state', async function () {
        let repeater = new StateRepeater();
        expect(await repeater).equal(undefined);
        repeater.subscribe((val) => { expect(val).equal(undefined); });
    });
    it('Adding subscriber to ValueRepeater with a state', async function () {
        let state = new State(true);
        let repeater = new StateRepeater(state);
        expect(await repeater).equal(true);
        repeater.subscribe((val) => { expect(val).equal(true); });
    });
    it('Adding subscriber to ValueRepeater without a state then setting state', async function () {
        let repeater = new StateRepeater();
        expect(await repeater).equal(undefined);
        let count = 0
        repeater.subscribe((val) => {
            count++;
            if (count === 2) {
                expect(val).equal(5);
                return;
            }
            expect(val).equal(undefined);
        });
        let state = new State(5);
        repeater.setState(state);
        expect(await repeater).equal(5);
    });
    it('Adding subscriber to ValueRepeater without a state then unsubscribing', async function () {
        let repeater = new StateRepeater();
        expect(await repeater).equal(undefined);
        let func = repeater.subscribe((val) => { });
        repeater.unsubscribe(func);
    });
    it('Adding subscriber to ValueRepeater without a state then unsubscribing then setting state', async function () {
        let repeater = new StateRepeater();
        expect(await repeater).equal(undefined);
        let func = repeater.subscribe((val) => { throw new Error; });
        repeater.unsubscribe(func);
        let state = new State(5);
        repeater.setState(state);
    });
    it('Adding subscriber to ValueRepeater without a state then setting state then unsubscribing', async function () {
        let repeater = new StateRepeater();
        expect(await repeater).equal(undefined);
        let func = repeater.subscribe((val) => { expect(val).equal(5); });
        let state = new State(5);
        repeater.setState(state);
        repeater.unsubscribe(func);
    });
});

describe('Async', function () {
    it('Repeater with async', async function () {
        let state = createTestAsync();
        let repeater = new StateRepeater(state);
        expect(await repeater).equal(1);
    });
});