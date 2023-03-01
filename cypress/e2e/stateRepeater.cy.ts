/// <reference types="cypress" />
import { State, StateRepeater, StateRepeaterLike } from "../../src"

describe('Setup', function () {
    it('Repeater without params should have value undefined and read func', function () {
        let repeat = new StateRepeater();
        expect(repeat.get).equal(undefined);
        expect(repeat.readFunc).exist;
        expect(repeat.readonly).true;
    });
    it('Repeater with state should have states value', function () {
        let state = new State(true);
        let repeat = new StateRepeater(state);
        expect(repeat.get).equal(true);
        expect(repeat.readFunc).exist;
        expect(repeat.readonly).true;
    });
    it('Repeater with read func should have read func', function () {
        let func = () => { }
        let repeat = new StateRepeater(undefined, func);
        expect(repeat.get).equal(undefined);
        expect(repeat.readFunc).equal(func);
        expect(repeat.readonly).true;
    });
    it('Repeater with write func should have write func', function () {
        let func = () => { }
        let repeat = new StateRepeater(undefined, undefined, func);
        expect(repeat.get).equal(undefined);
        expect(repeat.readFunc).exist;
        expect(repeat.writeFunc).equal(func);
        expect(repeat.readonly).false;
    });
});

describe('Subscribers', function () {
    it('Adding subscriber to ValueRepeater without a state', function () {
        let valueRepeater = new StateRepeater();
        expect(valueRepeater.get).equal(undefined);
        valueRepeater.subscribe((val) => { expect(val).equal(undefined); }, true);
        expect(valueRepeater.inUse).true;
    });
    it('Adding subscriber to ValueRepeater with a state', function () {
        let state = new State(true);
        let valueRepeater = new StateRepeater(state);
        expect(valueRepeater.get).equal(true);
        valueRepeater.subscribe((val) => { expect(val).equal(true); }, true);
        expect(state.inUse).true;
        expect(valueRepeater.inUse).true;
    });
    it('Adding subscriber to ValueRepeater without a state then setting state', function (done) {
        let valueRepeater = new StateRepeater<number, number>();
        expect(valueRepeater.get).equal(undefined);
        let count = 0
        valueRepeater.subscribe((val) => {
            count++;
            if (count === 2) {
                expect(val).equal(5);
                done()
            }
            expect(val).equal(undefined);
        }, true);
        expect(valueRepeater.inUse).true;
        valueRepeater.state = new State(5);
        expect(valueRepeater.get).equal(5);
    });
    it('Adding subscriber to ValueRepeater without a state then unsubscribing', function () {
        let valueRepeater = new StateRepeater<number, number>();
        expect(valueRepeater.get).equal(undefined);
        let func = valueRepeater.subscribe((val) => { }, true);
        expect(valueRepeater.inUse).true;
        valueRepeater.unsubscribe(func);
        expect(valueRepeater.inUse).false;
    });
    it('Adding subscriber to ValueRepeater without a state then unsubscribing then setting state', function () {
        let valueRepeater = new StateRepeater<number, number>();
        expect(valueRepeater.get).equal(undefined);
        let func = valueRepeater.subscribe((val) => { throw new Error; });
        expect(valueRepeater.inUse).true;
        valueRepeater.unsubscribe(func);
        expect(valueRepeater.inUse).false;
        valueRepeater.state = new State(5);
    });
    it('Adding subscriber to ValueRepeater without a state then setting state then unsubscribing', function () {
        let valueRepeater = new StateRepeater<number, number>();
        expect(valueRepeater.get).equal(undefined);
        let func = valueRepeater.subscribe((val) => { expect(val).equal(5); });
        expect(valueRepeater.inUse).true;
        let state = new State(5);
        valueRepeater.state = state;
        expect(state.inUse).true;
        valueRepeater.unsubscribe(func);
        expect(valueRepeater.inUse).false;
        expect(state.inUse).false;
    });
});

describe('Async', function () {
    it('Adding subscriber to ValueRepeater without a state then setting state then unsubscribing', function () {
        let valueRepeater = new StateRepeater();
        expect(valueRepeater.get).equal(undefined);
    });
});

describe('Value with single type must be able to be assignable to parameter with multiple types', function () {
    it('Value with async getter', function () {
        let value = new StateRepeater<boolean, number>(new State(1));
        let func = (val: StateRepeaterLike<number | boolean, number | boolean>) => { return val }
        func(value);
    });
});