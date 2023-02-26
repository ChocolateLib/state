/// <reference types="cypress" />
import { State, StateDerived, StateDerivedLike } from "../../src"

describe('Initial value', function () {
    it('Can be initialized with just read function', function () {
        new StateDerived(() => { });
    });
    it('Can be initialized with single Value', function () {
        new StateDerived(() => { }, [new State(1)]);
    });
    it('Can be initialized with multiple Values', function () {
        new StateDerived(() => { }, [new State(1), new State(2), new State(3)]);
    });
    it('Can be initialized with just read and write functions', function () {
        new StateDerived(() => { }, undefined, () => { });
    });
});

describe('Getting value', function () {
    it('Getting value from ValueMulti with no Values', function () {
        let multi = new StateDerived(() => { });
        expect(multi.get).equal(undefined);
    });
    it('Getting value from ValueMulti with Value with read function set', function () {
        let multi = new StateDerived(([a, b]) => { return a * b }, [new State(5), new State(5)],);
        expect(multi.get).equal(25);
    });
});

describe('Setting value', function () {
    it('Setting value on ValueMulti with no Values', function () {
        let multi = new StateDerived<any, any>(() => { });
        multi.set = 10;
    });
    it('Setting value from ValueMulti with Value with write function set', function () {
        let val1 = new State(5);
        let val2 = new State(5);
        let multi = new StateDerived<number, number>(() => { return 0 }, [val1, val2], (a, b, c) => {
            b[0] = a * 20;
            b[1] = a * 10;
        });
        multi.set = 3;
        expect(val1.get).equal(60);
        expect(val2.get).equal(30);
    });
});

describe('Listeners', function () {
    it('If a listener is added to a ValueMulti, it start listening to all Values', function () {
        let values = [new State(1), new State(2), new State(3)];
        let multi = new StateDerived(() => { }, values);
        multi.subscribe(() => { });
        expect(values[0].inUse).equal(true);
        expect(values[1].inUse).equal(true);
        expect(values[2].inUse).equal(true);
    });
    it('If a listener is added to a ValueMulti, it start listening to all Values', function (done) {
        let values = [new State(1), new State(2), new State(3)];
        let multi = new StateDerived((values) => { return values[0] }, values);
        multi.subscribe((val) => {
            expect(val).equal(2);
            done();
        });
        values[0].set = 2;
        values[1].set = 3;
        values[2].set = 4;
    });
    it('If a listener is added to a ValueMulti then removed, the Values should not have listeners', function () {
        let values = [new State(1), new State(2), new State(3)];
        let multi = new StateDerived(() => { }, values);
        let func = multi.subscribe(() => { });
        multi.unsubscribe(func);
        expect(values[0].inUse).equal(false);
        expect(values[1].inUse).equal(false);
        expect(values[2].inUse).equal(false);
    });
});

describe('Error Angles', function () {
    it('If an array is passed to the ValueMulti, and the array is modified, the ValueMulti shall not be affected', function () {
        let values = [new State(1), new State(2), new State(3)];
        let multi = new StateDerived((values) => { return values[0] }, values);
        expect(multi.get).equal(1);
        values.unshift(new State(4));
        expect(multi.get).equal(1);
    });
});

describe('Value with single type must be able to be assignable to parameter with multiple types', function () {
    it('Value with async getter', function () {
        let value = new StateDerived<number, number>(() => { return 1 });
        let func = (val: StateDerivedLike<number | boolean, number | boolean>) => { return val }
        func(value);
    });
});