/// <reference types="cypress" />
import { StateArray } from "../../src"

describe('Initial value', function () {
    it('Should have an initial value of array', function () {
        expect((new StateArray([])).get).instanceOf(Array);
    });
    it('Should have an initial value of array, with numbers', function () {
        let val = (new StateArray([1, 2, 3])).get;
        if (val instanceof Array) {
            expect(val[0]).equal(1);
            expect(val[1]).equal(2);
            expect(val[2]).equal(3);
        }
    });
    it('Should have an initial value of array, with booleans', function () {
        let val = (new StateArray([true, false, true])).get;
        if (val instanceof Array) {
            expect(val[0]).equal(true);
            expect(val[1]).equal(false);
            expect(val[2]).equal(true);
        }
    });
    it('Should have an initial value of array, with strings', function () {
        let val = (new StateArray(['1', '2', '3'])).get;
        if (val instanceof Array) {
            expect(val[0]).equal('1');
            expect(val[1]).equal('2');
            expect(val[2]).equal('3');
        }
    });
    it('Should have an initial value of array, with numbers, booleans and strings', function () {
        let val = (new StateArray([1, false, '3'])).get;
        if (val instanceof Array) {
            expect(val[0]).equal(1);
            expect(val[1]).equal(false);
            expect(val[2]).equal('3');
        }
    });
});

describe('Array Info', function () {
    it('Checking lenght of array', function () {
        let array = new StateArray<number>([1, 2, 3, 4, 5]);
        expect(array.length).equal(5);
        array.set = [1, 2, 3];
        expect(array.length).equal(3);
    });
    it('Finding index of value', function () {
        let array = new StateArray<number>([1, 2, 3, 4, 5]);
        expect(array.indexOf(3)).equal(2);
    });
    it('Finding index of value after a specific index', function () {
        let array = new StateArray<number>([1, 2, 3, 4, 5, 1]);
        expect(array.indexOf(1)).equal(0);
        expect(array.indexOf(1, 3)).equal(5);
    });
    it('Getting value at index', function () {
        let array = new StateArray<number>([1, 2, 3, 4, 5, 1]);
        expect(array.getIndex(1)).equal(2);
        expect(array.getIndex(4)).equal(5);
        expect(array.getIndex(9)).equal(undefined);
    });
    it('Comparing to null', function () {
        expect((new StateArray([1, 2, 3])).compare(null)).to.be.true;
    });
    it('Comparing to boolean', function () {
        expect((new StateArray([1, 2, 3])).compare(true)).to.be.true;
    });
    it('Comparing to number', function () {
        expect((new StateArray([1, 2, 3])).compare(1)).to.be.true;
    });
    it('Comparing to string', function () {
        expect((new StateArray([1, 2, 3])).compare('null')).to.be.true;
    });
    it('Comparing to object', function () {
        expect((new StateArray([1, 2, 3])).compare({})).to.be.true;
    });
    it('Comparing to different array', function () {
        expect((new StateArray([1, 2, 3])).compare([2, 3])).to.be.true;
    });
    it('Comparing to same array', function () {
        expect((new StateArray([1, 2, 3])).compare([1, 2, 3])).to.be.false;
    });
    it('Comparing to different ValueArray', function () {
        expect((new StateArray([1, 2, 3])).compare((new StateArray([2, 3])))).to.be.true;
    });
    it('Comparing to same ValueArray', function () {
        expect((new StateArray([1, 2, 3])).compare((new StateArray([1, 2, 3])))).to.be.false;
    });
    it('JSON override', function () {
        let value = new StateArray([1, 2, 3]);
        expect(JSON.stringify(value)).equal('[1,2,3]');
    });
    it('Includes', function () {
        let value = new StateArray([1, 2, 3]);
        expect(value.includes(2)).true
    });
});

describe('Array Modifications', function () {
    it('Pushing numbers to empty array', function () {
        let array = new StateArray<number>([]);
        array.push(1, 2, 3);
        expect(array.length).equal(3);
        let val = array.get;
        if (val instanceof Array) {
            expect(val[0]).equal(1);
            expect(val[1]).equal(2);
            expect(val[2]).equal(3);
        }
    });
    it('Pushing numbers to array with element in', function () {
        let array = new StateArray<number>([0]);
        array.push(1, 2, 3);
        expect(array.length).equal(4);
        let val = array.get;
        if (val instanceof Array) {
            expect(val[1]).equal(1);
            expect(val[2]).equal(2);
            expect(val[3]).equal(3);
        }
    });
    it('Unshifting numbers to empty array', function () {
        let array = new StateArray<number>([]);
        array.unshift(1, 2, 3);
        expect(array.length).equal(3);
        let val = array.get;
        if (val instanceof Array) {
            expect(val[0]).equal(1);
            expect(val[1]).equal(2);
            expect(val[2]).equal(3);
        }
    });
    it('Unshifting numbers to array with element in', function () {
        let array = new StateArray<number>([0]);
        array.unshift(1, 2, 3);
        expect(array.length).equal(4);
        let val = array.get;
        if (val instanceof Array) {
            expect(val[0]).equal(1);
            expect(val[1]).equal(2);
            expect(val[2]).equal(3);
        }
    });
    it('Popping from array', function () {
        let array = new StateArray<number>([0, 1, 2, 3, 4, 5, 6]);
        let res = array.pop();
        expect(array.length).equal(6);
        let val = array.get;
        if (val instanceof Array) {
            expect(res).equal(6);
        }
    });
    it('Popping from array so it becomes empty', function () {
        let array = new StateArray<number>([0]);
        let res = array.pop();
        expect(array.length).equal(0);
        let val = array.get;
        if (val instanceof Array) {
            expect(res).equal(0);
        }
    });
    it('Shifting from array', function () {
        let array = new StateArray<number>([0, 1, 2, 3, 4, 5, 6]);
        let res = array.shift();
        expect(array.length).equal(6);
        let val = array.get;
        if (val instanceof Array) {
            expect(res).equal(0);
        }
    });
    it('Shifting from array so it becomes empty', function () {
        let array = new StateArray<number>([6]);
        let res = array.shift();
        expect(array.length).equal(0);
        let val = array.get;
        if (val instanceof Array) {
            expect(res).equal(6);
        }
    });
    it('Splicing element into empty array', function () {
        let array = new StateArray<number>([]);
        let res = array.splice(0, 0, 1, 2, 3);
        expect(array.length).equal(3);
        expect(res).instanceOf(Array);
        let val = array.get;
        if (val instanceof Array) {
            expect(val[0]).equal(1);
            expect(val[1]).equal(2);
            expect(val[2]).equal(3);
        }
    });
    it('Splicing element into none empty array', function () {
        let array = new StateArray<number>([7, 8, 9]);
        let res = array.splice(2, 0, 1, 2, 3);
        expect(array.length).equal(6);
        expect(res).instanceOf(Array);
        let val = array.get;
        if (val instanceof Array) {
            expect(val[0]).equal(7);
            expect(val[1]).equal(8);
            expect(val[2]).equal(1);
        }
    });
    it('Splicing element from array', function () {
        let array = new StateArray<number>([1, 2, 3, 4, 5]);
        let res = array.splice(2, 2);
        expect(array.length).equal(3);
        expect(res).instanceOf(Array);
        let val = array.get;
        if (val instanceof Array) {
            expect(val[0]).equal(1);
            expect(val[2]).equal(5);
            expect(res[0]).equal(3);
            expect(res[1]).equal(4);
        }
    });
    it('Splicing element into empty array and from array', function () {
        let array = new StateArray<number>([]);
        let res = array.splice(2, 2, 1, 2, 3);
        expect(array.length).equal(3);
        expect(res).instanceOf(Array);
        let val = array.get;
        if (val instanceof Array) {
            expect(val[0]).equal(1);
            expect(val[2]).equal(3);
            expect(res.length).equal(0);
        }
    });
    it('Splicing element into array and from array', function () {
        let array = new StateArray<number>([7, 8, 9, 10]);
        let res = array.splice(2, 2, 1, 2, 3);
        expect(array.length).equal(5);
        expect(res).instanceOf(Array);
        let val = array.get;
        if (val instanceof Array) {
            expect(val[0]).equal(7);
            expect(val[2]).equal(1);
            expect(res[0]).equal(9);
            expect(res[1]).equal(10);
        }
    });
    it('Empty array', function () {
        let array = new StateArray<number>([7, 8, 9, 10]);
        array.empty();
        expect(array.length).equal(0);
    });
    it('Remove if exist function', function () {
        let array = new StateArray<number>([7, 8, 9, 10, 7, 8, 9, 7, 8, 9]);
        expect(array.remove(7)).equal(true);
        expect(array.length).equal(7);
        let val = array.get;
        if (val instanceof Array) {
            expect(val[0]).equal(8);
        }
    });
    it('Remove if exist after index', function () {
        let array = new StateArray<number>([7, 8, 9, 10, 7, 8, 9, 7, 8, 9]);
        expect(array.remove(7, 7)).equal(true);
        expect(array.length).equal(9);
        let val = array.get;
        if (val instanceof Array) {
            expect(val[0]).equal(7);
        }
    });
    it('Remove if exist removing nothing', function () {
        let array = new StateArray<number>([7, 8, 9, 10, 7, 8, 9, 7, 8, 9]);
        expect(array.remove(99)).equal(false);
        expect(array.length).equal(10);
    });
    it('Setting value of index', function () {
        let array = new StateArray<number>([7, 8, 9, 10, 7, 8, 9, 7, 8, 9]);
        array.setIndex(3, 99);
        let val = array.get;
        if (val instanceof Array) {
            expect(val[3]).equal(99);
        }
    });
    it('Setting value of index which does not exist', function () {
        let array = new StateArray<number>([7, 8, 9]);
        array.setIndex(10, 99);
        expect(array.length).equal(11);
        let val = array.get;
        if (val instanceof Array) {
            expect(val[4]).equal(undefined);
            expect(val[6]).equal(undefined);
            expect(val[10]).equal(99);
        }
    });
});

describe('Listeners', function () {
    it('Adding subscribers to array', function () {
        let array = new StateArray<number>([1, 2, 3, 4, 5]);
        let func = (f: number) => { };
        expect(array.subscribeArray(func)).equal(func);
        expect(array.arrayInUse).to.be.true;
        expect(array.hasArraySubscriber(func)).to.be.true;
    });
    it('Adding multiple subscriberss to array', function () {
        let array = new StateArray<number>([1, 2, 3, 4, 5]);
        let func = (f: number) => { };
        expect(array.subscribeArray(func)).equal(func);
        let func1 = (f: number) => { };
        expect(array.subscribeArray(func1)).equal(func1);
        let func2 = (f: number) => { };
        expect(array.subscribeArray(func2)).equal(func2);
        expect(array.arrayInUse).to.be.true;
        expect(array.hasArraySubscriber(func)).to.be.true;
        expect(array.hasArraySubscriber(func1)).to.be.true;
        expect(array.hasArraySubscriber(func2)).to.be.true;
    });
    it('Adding and removing multiple subscriberss to/from array', function () {
        let array = new StateArray<number>([1, 2, 3, 4, 5]);
        let func = (f: number) => { };
        expect(array.subscribeArray(func)).equal(func);
        let func1 = (f: number) => { };
        expect(array.subscribeArray(func1)).equal(func1);
        let func2 = (f: number) => { };
        expect(array.subscribeArray(func2)).equal(func2);
        expect(array.arrayInUse).to.be.true;
        expect(array.hasArraySubscriber(func)).to.be.true;
        expect(array.hasArraySubscriber(func1)).to.be.true;
        expect(array.hasArraySubscriber(func2)).to.be.true;
        expect(array.unsubscribeArray(func)).equal(func);
        expect(array.hasArraySubscriber(func)).to.be.false;
        expect(array.hasArraySubscriber(func1)).to.be.true;
        expect(array.hasArraySubscriber(func2)).to.be.true;
        expect(array.unsubscribeArray(func2)).equal(func2);
        expect(array.hasArraySubscriber(func2)).to.be.false;
        expect(array.hasArraySubscriber(func1)).to.be.true;
    });
});

describe('Events', function () {
    it('Event on pushing one value', function (done) {
        let array = new StateArray<number>([1]);
        let func = (index: number, amount: number, values?: number[]) => {
            expect(index).equal(1);
            expect(amount).equal(1);
            expect(values).instanceOf(Array);
            if (values) {
                expect(values[0]).equal(2);
            }
            done();
        };
        array.subscribeArray(func);
        array.push(2);
    });
    it('Event on pushing multiple value', function (done) {
        let array = new StateArray<number>([1, 2]);
        let func = (index: number, amount: number, values?: number[]) => {
            expect(index).equal(2);
            expect(amount).equal(4);
            expect(values).instanceOf(Array);
            if (values) {
                expect(values.length).equal(4);
            }
            done();
        };
        array.subscribeArray(func);
        array.push(2, 3, 4, 5);
    });
    it('Event on unshifting one value', function (done) {
        let array = new StateArray<number>([1]);
        let func = (index: number, amount: number, values?: number[]) => {
            expect(index).equal(0);
            expect(amount).equal(1);
            expect(values).instanceOf(Array);
            if (values) {
                expect(values[0]).equal(2);
            }
            done();
        };
        array.subscribeArray(func);
        array.unshift(2);
    });
    it('Event on unshifting multiple value', function (done) {
        let array = new StateArray<number>([1, 2]);
        let func = (index: number, amount: number, values?: number[]) => {
            expect(index).equal(0);
            expect(amount).equal(4);
            expect(values).instanceOf(Array);
            if (values) {
                expect(values.length).equal(4);
            }
            done();
        };
        array.subscribeArray(func);
        array.unshift(2, 3, 4, 5);
    });
    it('Event on popping value', function (done) {
        let array = new StateArray<number>([1, 2, 3, 4]);
        let func = (index: number, amount: number, values?: number[]) => {
            expect(index).equal(3);
            expect(amount).equal(-1);
            expect(values).to.be.undefined;
            done();
        };
        array.subscribeArray(func);
        array.pop();
    });
    it('Event on shifting value', function (done) {
        let array = new StateArray<number>([1, 2, 3, 4]);
        let func = (index: number, amount: number, values?: number[]) => {
            expect(index).equal(0);
            expect(amount).equal(-1);
            expect(values).to.be.undefined;
            done();
        };
        array.subscribeArray(func);
        array.shift();
    });
    it('Event on splicing values into array', function (done) {
        let array = new StateArray<number>([1, 2, 3, 4]);
        let func = (index: number, amount: number, values?: number[]) => {
            expect(index).equal(2);
            expect(amount).equal(3);
            expect(values).instanceOf(Array);
            if (values) {
                expect(values.length).equal(3);
            }
            done();
        };
        array.subscribeArray(func);
        array.splice(2, 0, 1, 2, 3);
    });
    it('Event on splicing values from array', function (done) {
        let array = new StateArray<number>([1, 2, 3, 4, 5, 6, 7]);
        let func = (index: number, amount: number, values?: number[]) => {
            expect(index).equal(2);
            expect(amount).equal(-3);
            expect(values).to.be.undefined;
            done();
        };
        array.subscribeArray(func);
        array.splice(2, 3);
    });
    it('Event on splicing values to/from array', function (done) {
        let array = new StateArray<number>([1, 2, 3, 4, 5, 6, 7]);
        let i = 0
        let func = (index: number, amount: number, values?: number[]) => {
            if (i == 0) {
                expect(index).equal(2);
                expect(amount).equal(-3);
                expect(values).to.be.undefined;
            } else {
                expect(index).equal(2);
                expect(amount).equal(3);
                expect(values).instanceOf(Array);
                if (values) {
                    expect(values.length).equal(3);
                }
                done();
            }
            i++;
        };
        array.subscribeArray(func);
        array.splice(2, 3, 1, 2, 3);
    });
    it('Event on removeif exist', function (done) {
        let array = new StateArray<number>([1, 2, 3, 4, 5, 6, 7]);
        let func = (index: number, amount: number, values?: number[]) => {
            expect(index).equal(1);
            expect(amount).equal(-1);
            expect(values).to.be.undefined;
            done();
        };
        array.subscribeArray(func);
        array.remove(2);
    });
    it('Event on setIndex', function (done) {
        let array = new StateArray<number>([1, 2, 3, 4, 5]);
        let func = (index: number, amount: number, values?: number[]) => {
            expect(index).equal(2);
            expect(amount).equal(0);
            expect(values).instanceOf(Array);
            if (values) {
                expect(values[0]).equal(99);
            }
            done();
        };
        array.subscribeArray(func);
        array.setIndex(2, 99);
    });
    it('Event on setIndex outside existing array', function (done) {
        let array = new StateArray<number>([1, 2, 3, 4, 5]);
        let func = (index: number, amount: number, values?: number[]) => {
            expect(index).equal(5);
            expect(amount).equal(6);
            expect(values).instanceOf(Array);
            if (values) {
                expect(values[0]).equal(undefined);
                expect(values[5]).equal(undefined);
            }
            done();
        };
        array.subscribeArray(func);
        array.setIndex(10, 99);
    });
});

describe('Other', function () {
    it('State as a type with multiple generics', function () {
        let value = new StateArray([10]);
        let func = (val: StateArray<number | boolean>) => { return val }
        func(value);
    });
});