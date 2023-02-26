/// <reference types="cypress" />
import { State, StateAverage, StateSummer } from "../../src"


describe('Averaging Value', function () {
    describe('Initial value', function () {
        it('Can be initialized without arguments', function () {
            new StateAverage();
        });
        it('Can be initialized with single Value', function () {
            new StateAverage([new State(1)]);
        });
        it('Can be initialized with multiple Values', function () {
            new StateAverage([new State(1), new State(2), new State(3)]);
        });
        it('Can be initialized with just read function', function () {
            new StateAverage(undefined);
        });
        it('Can be initialized with just write function', function () {
            new StateAverage(undefined);
        });
    });

    describe('Getting value', function () {
        it('Getting value from ValueAverage with no Values', function () {
            let multi = new StateAverage();
            expect(multi.get).equal(undefined);
        });
        it('Getting value from ValueAverage with Value but without setting a function just returns the value of the first Value', function () {
            let val = 1;
            let multi = new StateAverage([new State(val), new State(99)]);
            expect(multi.get).equal(50);
        });
    });

    describe('Setting value', function () {
        it('Setting value on ValueAverage with no Values', function () {
            let multi = new StateAverage();
            multi.set = 10;
        });
        it('Setting value on ValueAverage', function () {
            let value1 = new State(1);
            let value2 = new State(2);
            let multi = new StateAverage([value1, value2]);
            multi.set = 10;
            expect(value1.get).equal(9.5);
            expect(value2.get).equal(10.5);
        });
    });

    describe('Listeners', function () {
        it('Listener should return average of values', function (done) {
            let values = [new State(1), new State(2), new State(3)];
            let multi = new StateAverage(values);
            multi.subscribe((val) => {
                expect(val).equal(3);
                done();
            });
            values[0].set = 2;
            values[1].set = 3;
            values[2].set = 4;
        });
    });
});

describe('Summing Value', function () {
    describe('Initial value', function () {
        it('Can be initialized without arguments', function () {
            new StateSummer();
        });
        it('Can be initialized with single Value', function () {
            new StateSummer([new State(1)]);
        });
        it('Can be initialized with multiple Values', function () {
            new StateSummer([new State(1), new State(2), new State(3)]);
        });
        it('Can be initialized with just read function', function () {
            new StateSummer(undefined);
        });
        it('Can be initialized with just write function', function () {
            new StateSummer(undefined);
        });
    });

    describe('Getting value', function () {
        it('Getting value from ValueSummer with no Values', function () {
            let multi = new StateSummer();
            expect(multi.get).equal(undefined);
        });
        it('Getting value from ValueSummer', function () {
            let val = 1;
            let multi = new StateSummer([new State(val), new State(99)]);
            expect(multi.get).equal(100);
        });
    });

    describe('Setting value', function () {
        it('Setting value on ValueSummer with no Values', function () {
            let multi = new StateSummer();
            multi.set = 10;
        });
        it('Setting value on ValueSummer', function () {
            let value1 = new State(1);
            let value2 = new State(2);
            let multi = new StateSummer([value1, value2]);
            multi.set = 10;
            expect(value1.get).equal(4.5);
            expect(value2.get).equal(5.5);
        });
    });

    describe('Listeners', function () {
        it('Listener should return sum of values', function (done) {
            let values = [new State(1), new State(2), new State(3)];
            let multi = new StateSummer(values);
            multi.subscribe((val) => {
                expect(val).equal(9);
                done();
            });
            values[0].set = 2;
            values[1].set = 3;
            values[2].set = 4;
        });
    });
});