/// <reference types="cypress" />
import { State, StateRepeater, StateRepeaterLike } from "../../src"

describe('Initialize Value repeater', function () {
    it('Repeater without Value should have value undefined', function () {
        expect((new StateRepeater()).get).equal(undefined);
    });
});
describe('Initialize value repeater with Value', function () {
    it('Repeater linked to Value with undefined value should have value undefined', function () {
        let value = new State(undefined);
        expect((new StateRepeater(value)).get).equal(undefined);
    });
    it('Repeater linked to Value with null value should have value null', function () {
        let value = new State(null);
        expect((new StateRepeater(value)).get).equal(null);
    });
    it('Repeater linked to Value with boolean value should have boolean value', function () {
        let value = new State(true);
        expect((new StateRepeater(value)).get).equal(true);
    });
    it('Repeater linked to Value with number value should have number value', function () {
        let value = new State(1);
        expect((new StateRepeater(value)).get).equal(1);
    });
    it('Repeater linked to Value with string value should have string value', function () {
        let value = new State('asdf');
        expect((new StateRepeater(value)).get).equal('asdf');
    });
    it('Repeater linked to Value with object value should have object value', function () {
        let value = new State({});
        expect(typeof (new StateRepeater(value)).get).equal('object');
    });
    it('Repeater linked to Value with array value should have array value', function () {
        let value = new State([]);
        expect((new StateRepeater(value)).get).instanceOf(Array);
    });
});

describe('Initialize value repeater without repeater Value then adding subscribers', function () {
    it('Adding subscriber to ValueRepeater without repeater works', function () {
        let valueRepeater = new StateRepeater();
        valueRepeater.subscribe((val) => { });
        expect(valueRepeater.inUse).to.be.true;
    });
    it('Adding subscriber with run set true to ValueRepeater without repeater runs subscriber with value undefined', function () {
        let valueRepeater = new StateRepeater();
        valueRepeater.subscribe((val) => {
            expect(val).equal(undefined);
        }, true);
    });
});

describe('Initialize value repeater with repeater Value then adding subscribers', function () {
    it('Adding subscriber with run set true to ValueRepeater with repeater with initial value null runs subscriber with value null', function () {
        let value = new State(null);
        let valueRepeater = new StateRepeater(value);
        valueRepeater.subscribe((val) => {
            expect(val).equal(null);
        }, true);
    });
    it('Adding subscriber with run set true to ValueRepeater with repeater with initial boolean value runs subscriber with boolean value', function () {
        let init = true;
        let value = new State(init);
        let valueRepeater = new StateRepeater(value);
        valueRepeater.subscribe((val) => {
            expect(val).equal(init);
        }, true);
    });
    it('Adding subscriber with run set true to ValueRepeater with repeater with initial number value undefined runs subscriber with number value', function () {
        let init = 1;
        let value = new State(init);
        let valueRepeater = new StateRepeater(value);
        valueRepeater.subscribe((val) => {
            expect(val).equal(init);
        }, true);
    });
    it('Adding subscriber with run set true to ValueRepeater with repeater with initial string value runs subscriber with string value', function () {
        let init = 'true';
        let value = new State(init);
        let valueRepeater = new StateRepeater(value);
        valueRepeater.subscribe((val) => {
            expect(val).equal(init);
        }, true);
    });
    it('Adding subscriber with run set true to ValueRepeater with repeater with initial object value runs subscriber with object value', function () {
        let value = new State({});
        let valueRepeater = new StateRepeater(value);
        valueRepeater.subscribe((val) => {
            expect(typeof val).equal('object');
        }, true);
    });
    it('Adding subscriber with run set true to ValueRepeater with repeater with array value undefined runs subscriber with array value', function () {
        let value = new State([]);
        let valueRepeater = new StateRepeater(value);
        valueRepeater.subscribe((val) => {
            expect(val).instanceOf(Array);
        }, true);
    });
});

describe('Initialize value repeater without repeater Value then adding subscribers then setting repeater with different values', function () {
    it('Adding repeater to ValueRepeater with subscriber does nothing', function () {
        let valueRepeater = new StateRepeater<undefined, undefined>();
        valueRepeater.subscribe((val) => {
            throw new Error('This shouldn\'t happen');
        });
        valueRepeater.state = new State(undefined);
    });
    it('Adding repeater with initial boolean value to ValueRepeater with subscriber', function (done) {
        let init = true;
        let valueRepeater = new StateRepeater<boolean, boolean>();
        valueRepeater.subscribe((val) => {
            expect(val).equal(init);
            done();
        });
        valueRepeater.state = new State(init);
    });
    it('Adding repeater with initial number value to ValueRepeater with subscriber', function (done) {
        let init = 1;
        let valueRepeater = new StateRepeater<number, number>();
        valueRepeater.subscribe((val) => {
            expect(val).equal(init);
            done();
        });
        valueRepeater.state = new State(init);
    });
    it('Adding repeater with initial string value to ValueRepeater with subscriber', function (done) {
        let init = 'true';
        let valueRepeater = new StateRepeater<string, string>();
        valueRepeater.subscribe((val) => {
            expect(val).equal(init);
            done();
        });
        valueRepeater.state = new State(init);
    });
    it('Adding repeater with initial object value to ValueRepeater with subscriber', function (done) {
        let init = {};
        let valueRepeater = new StateRepeater<object, object>();
        valueRepeater.subscribe((val) => {
            expect(typeof val).equal('object');
            done();
        });
        valueRepeater.state = new State(init);
    });
    it('Adding repeater with initial array value to ValueRepeater with subscriber', function (done) {
        let init = [1];
        let valueRepeater = new StateRepeater<Array<number>, Array<number>>();
        valueRepeater.subscribe((val) => {
            expect(val).instanceOf(Array);
            done();
        });
        valueRepeater.state = new State(init);
    });
});

describe('Changing repeater of ValueRepeater with repeater', function () {
    it('Adding repeater to ValueRepeater with subscriber', function (done) {
        let valueRepeater = new StateRepeater(new State(1));
        valueRepeater.subscribe((val) => {
            expect(val).equal(2);
            done();
        });
        valueRepeater.state = new State(2);
    });
    it('Adding repeater to ValueRepeater with subscriber', function (done) {
        let valueRepeater = new StateRepeater(new State(1));
        let prog = 0;
        valueRepeater.subscribe((val) => {
            prog++;
            if (prog == 1) {
                expect(val).equal(2);
            }
            if (prog == 2) {
                expect(val).equal(3);
                done();
            }
        });
        valueRepeater.state = new State(2);
        valueRepeater.state = new State(3);
    });
});


describe('Value with single type must be able to be assignable to parameter with multiple types', function () {
    it('Value with async getter', function () {
        let value = new StateRepeater<boolean, number>(new State(1));
        let func = (val: StateRepeaterLike<number | boolean, number | boolean>) => { return val }
        func(value);
    });
});

describe('Methods and properties', function () {
    it('hasListener', function () {
        let state = new StateRepeater();
        expect(state.inUse).equal(false);
        state.subscribe(() => { });
        expect(state.inUse).equal(true);
    });
    it('Compare same type', function () {
        let val = new State(10);
        let state = new StateRepeater(val);
        expect(state.compare(10)).equal(false);
        expect(state.compare(11)).equal(true);
    });
    it('Compare different type', function () {
        let val = new State(10);
        let state = new StateRepeater(val);
        expect(state.compare('10')).equal(true);
        expect(state.compare('11')).equal(true);
    });
    it('JSON override', function () {
        let val = new State(10);
        let state = new StateRepeater(val);
        expect(JSON.stringify(state)).equal('10');
    });
    it('Info about state', function () {
        let state = new StateRepeater();
        state.info = { name: 'Test' };
        expect(state.info).deep.equal({ name: 'Test' });
        state.info = { name: 'Test', description: 'TestDesc' };
        expect(state.info).deep.equal({ name: 'Test', description: 'TestDesc' });
    });
});