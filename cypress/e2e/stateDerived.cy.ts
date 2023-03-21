/// <reference types="cypress" />
import { createStateDerived, createState, createStateAverager, createStateSummer } from "../../src"
import { createTestAsync } from "./testAsync";


describe('Getting value', function () {
    it('Getting value from ValueMulti with no Values', async function () {
        let derived = createStateDerived(() => { });
        expect(await derived).equal(undefined);
    });
    it('Getting value from ValueMulti with Value with read function set', async function () {
        let state1 = createState(5);
        let state2 = createState(6);
        let derived = createStateDerived(([a, b]) => { return a * b }, ...[state1, state2],);
        expect(await derived).equal(30);
    });
});

describe('Subscribers', function () {
    it('If a subscriber is added to a ValueMulti, it start listening to all Values', function (done) {
        let state1 = createState(1);
        let state2 = createState(2);
        let state3 = createState(3);
        let derived = createStateDerived((values) => { return values[0] }, ...[state1, state2, state3]);
        derived.subscribe((value) => {
            expect(value).equal(1);
            done();
        }, true);
    });
    it('If a subscriber is added to a ValueMulti, it start listening to all Values', function (done) {
        let state1 = createState(1);
        let state2 = createState(2);
        let state3 = createState(3);
        let derived = createStateDerived((values) => { return values[0] }, ...[state1, state2, state3]);
        derived.subscribe((val) => {
            expect(val).equal(2);
            done();
        });
        state1.set(2);
        state2.set(3);
        state3.set(4);
    });
    it('If a subscriber is added to a ValueMulti then removed, the Values should not have listeners', function () {
        let state1 = createState(1);
        let state2 = createState(2);
        let state3 = createState(3);
        let derived = createStateDerived((values) => { return values[0] }, ...[state1, state2, state3]);
        let func = derived.subscribe(() => { });
        derived.unsubscribe(func);
    });
});

describe('Error Angles', function () {
    it('If an array is passed to the ValueMulti, and the array is modified, the ValueMulti shall not be affected', async function () {
        let state1 = createState(1);
        let state2 = createState(2);
        let state3 = createState(3);
        let state4 = createState(4);
        let values = [state1, state2, state3];
        let derived = createStateDerived((values) => { return values[0] }, ...values);
        expect(await derived).equal(1);
        values.unshift(state4);
        expect(await derived).equal(1);
    });
});

describe('Average', function () {
    it('If an array is passed to the ValueMulti, and the array is modified, the ValueMulti shall not be affected', async function () {
        let state1 = createState(1);
        let state2 = createState(2);
        let state3 = createState(3);
        let state4 = createState(4);
        let derived = createStateAverager(state1, state2, state3);
        expect(await derived).equal(2);
        derived.setStates(state1, state2, state3, state4)
        expect(await derived).equal(2.5);
    });
});

describe('Sum', function () {
    it('If an array is passed to the ValueMulti, and the array is modified, the ValueMulti shall not be affected', async function () {
        let state1 = createState(1);
        let state2 = createState(2);
        let state3 = createState(3);
        let state4 = createState(4);
        let derived = createStateSummer(state1, state2, state3);
        expect(await derived).equal(6);
        derived.setStates(state1, state2, state3, state4)
        expect(await derived).equal(10);
    });
});

describe('Error Angles', function () {
    it('If an array is passed to the ValueMulti, and the array is modified, the ValueMulti shall not be affected', async function () {
        let state1 = createState(1);
        let state2 = createState(2);
        let state3 = createState(3);
        let state4 = createState(4);
        let values = [state1, state2, state3];
        let derived = createStateDerived((values) => { return values[0] }, ...values);
        expect(await derived).equal(1);
        values.unshift(state4);
        expect(await derived).equal(1);
    });
});