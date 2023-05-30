/// <reference types="cypress" />
import { StateDerived, State, StateAverage as StateAverager, StateSummer } from "../../src"
import { createTestAsync } from "./testAsync";


describe('Getting value', function () {
    it('Getting value from ValueDerived with no Values', async function () {
        let derived = new StateDerived(() => { });
        expect(await derived).equal(undefined);
    });
    it('Getting value from ValueDerived with Value with read function set', async function () {
        let state1 = new State(5);
        let state2 = new State(6);
        let derived = new StateDerived(([a, b]) => { return a * b }, ...[state1, state2],);
        expect(await derived).equal(30);
    });
});

describe('Subscribers', function () {
    it('If a subscriber is added to a ValueDerived, it start listening to all Values', function (done) {
        let state1 = new State(1);
        let state2 = new State(2);
        let state3 = new State(3);
        let derived = new StateDerived((values) => { return values[0] }, ...[state1, state2, state3]);
        derived.subscribe((value) => {
            expect(value).equal(1);
            done();
        }, true);
    });
    it('If a subscriber is added to a ValueDerived, it start listening to all Values', function (done) {
        let state1 = new State(1);
        let state2 = new State(2);
        let state3 = new State(3);
        let derived = new StateDerived((values) => { return values[0] }, ...[state1, state2, state3]);
        derived.subscribe((val) => {
            expect(val).equal(2);
            done();
        });
        state1.set(2);
        state2.set(3);
        state3.set(4);
    });
    it('If a subscriber is added to a ValueDerived then removed, the Values should not have listeners', function () {
        let state1 = new State(1);
        let state2 = new State(2);
        let state3 = new State(3);
        let derived = new StateDerived((values) => { return values[0] }, ...[state1, state2, state3]);
        let func = derived.subscribe(() => { });
        derived.unsubscribe(func);
    });
});

describe('Error Angles', function () {
    it('If an array is passed to the ValueDerived, and the array is modified, the ValueDerived shall not be affected', async function () {
        let state1 = new State(1);
        let state2 = new State(2);
        let state3 = new State(3);
        let state4 = new State(4);
        let values = [state1, state2, state3];
        let derived = new StateDerived((values) => { return values[0] }, ...values);
        expect(await derived).equal(1);
        values.unshift(state4);
        expect(await derived).equal(1);
    });
});

describe('Average', function () {
    it('If an array is passed to the ValueDerived, and the array is modified, the ValueDerived shall not be affected', async function () {
        let state1 = new State(1);
        let state2 = new State(2);
        let state3 = new State(3);
        let state4 = new State(4);
        let derived = new StateAverager(state1, state2, state3);
        expect(await derived).equal(2);
        derived.setStates(state1, state2, state3, state4)
        expect(await derived).equal(2.5);
    });
});

describe('Sum', function () {
    it('If an array is passed to the ValueDerived, and the array is modified, the ValueDerived shall not be affected', async function () {
        let state1 = new State(1);
        let state2 = new State(2);
        let state3 = new State(3);
        let state4 = new State(4);
        let derived = new StateSummer(state1, state2, state3);
        expect(await derived).equal(6);
        derived.setStates(state1, state2, state3, state4)
        expect(await derived).equal(10);
    });
});

describe('Error Angles', function () {
    it('If an array is passed to the ValueDerived, and the array is modified, the ValueDerived shall not be affected', async function () {
        let state1 = new State(1);
        let state2 = new State(2);
        let state3 = new State(3);
        let state4 = new State(4);
        let values = [state1, state2, state3];
        let derived = new StateDerived((values) => { return values[0] }, ...values);
        expect(await derived).equal(1);
        values.unshift(state4);
        expect(await derived).equal(1);
    });
});