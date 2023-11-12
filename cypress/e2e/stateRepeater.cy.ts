/// <reference types="cypress" />
import { Err, Ok } from "@chocolatelib/result";
import { StateRepeater, State } from "../../src"

describe('Setup', function () {
    it('Repeater without params should have value undefined and read func', async function () {
        let repeater = new StateRepeater();
        expect((await repeater).err).equal(true);
    });
    it('Repeater with state should have states value', async function () {
        let state = new State(Ok(true));
        let repeater = new StateRepeater(state);
        expect((await repeater).unwrap).equal(true);
    });
    it('Repeater with read func should change read func', async function () {
        let state = new State(Ok(10));
        let repeater = new StateRepeater<number, number>(state, (val) => val.map(v => v * 10));
        expect((await repeater).unwrap).equal(100);
    });
});

describe('Subscribers', function () {
    it('Adding subscriber to ValueRepeater without a state', async function () {
        let repeater = new StateRepeater();
        expect((await repeater).err).equal(true);
        await new Promise((a) => {
            repeater.subscribe((val) => {
                expect(val.err).equal(true);
                a(0);
            }, true);
        })
    });
    it('Adding subscriber to ValueRepeater with a state', async function () {
        let state = new State(Ok(true));
        let repeater = new StateRepeater(state);
        expect((await repeater).unwrap).equal(true);
        await new Promise((a) => {
            repeater.subscribe((val) => {
                expect(val.unwrap).equal(true);
                a(0)
            }, true);
        });
    });
    it('Adding subscriber to ValueRepeater without a state then setting state', async function () {
        let repeater = new StateRepeater<number, number>();
        expect((await repeater).err).equal(true);
        let count = 0
        repeater.subscribe((val) => {
            count++;
            if (count === 2) {
                expect(val).equal(5);
                return;
            }
            expect(val).equal(undefined);
        });
        let state = new State(Ok(5));
        repeater.setState(state);
        expect((await repeater).unwrap).equal(5);
    });
    it('Adding subscriber to ValueRepeater without a state then unsubscribing', async function () {
        let repeater = new StateRepeater();
        expect((await repeater).err).equal(true);
        let func = repeater.subscribe((val) => { });
        repeater.unsubscribe(func);
    });
    it('Adding subscriber to ValueRepeater without a state then unsubscribing then setting state', async function () {
        let repeater = new StateRepeater();
        expect((await repeater).err).equal(true);
        let func = repeater.subscribe((val) => { throw new Error; });
        repeater.unsubscribe(func);
        let state = new State(Ok(5));
        repeater.setState(state);
    });
    it('Adding subscriber to ValueRepeater without a state then setting state then unsubscribing', async function () {
        let repeater = new StateRepeater();
        expect((await repeater).err).equal(true);
        let func = repeater.subscribe((val) => { expect(val).equal(5); });
        let state = new State(Ok(5));
        repeater.setState(state);
        repeater.unsubscribe(func);
    });
});