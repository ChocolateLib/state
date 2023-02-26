/// <reference types="cypress" />
import { State, StateLike } from "../../src"

describe('Initial state', function () {
    it('Should have an initial state of null', function () {
        expect((new State(null)).get).equal(null);
    });
    it('Should have an initial state of true', function () {
        expect((new State(true)).get).equal(true);
    });
    it('Should have an initial state of 1', function () {
        expect((new State(1)).get).equal(1);
    });
    it('Should have an initial state of "test"', function () {
        expect((new State('test')).get).equal('test');
    });
    it('Should have an initial state type of an object', function () {
        expect(typeof (new State({})).get).equal('object');
    });
    it('Should have an initial state type of an array', function () {
        expect((new State([])).get).instanceOf(Array);
    });
});

describe('Setting state', function () {
    it('Setting state to true', function () {
        let state = new State(false);
        state.set = true;
        expect(state.get).equal(true);
    });
    it('Setting state to 1', function () {
        let state = new State(0);
        state.set = 1;
        expect(state.get).equal(1);
    });
    it('Setting state to "test"', function () {
        let state = new State('');
        state.set = 'test';
        expect(state.get).equal('test');
    });
    it('Setting state to an object', function () {
        let state = new State<number | {}>(0);
        state.set = {};
        expect(typeof state.get).equal('object');
    });
    it('Setting state to an array', function () {
        let state = new State<number | {}>(0);
        state.set = [];
        expect(state.get).instanceOf(Array);
    });
});

describe('Getting state', function () {
    it('Getting state with null state', function () { expect((new State(null)).get).equal(null); });
    it('Setting state to true', function () { expect((new State(true)).get).equal(true); });
    it('Setting state to 1', function () { expect((new State(1)).get).equal(1); });
    it('Setting state to "test"', function () { expect((new State('test')).get).equal('test'); });
    it('Setting state to an object', function () { expect(typeof (new State({})).get).equal('object'); });
    it('Setting state to an array', function () { expect((new State([])).get).instanceOf(Array); });
});

describe('Adding and removing subscribers', function () {
    it('Add one subscribers correctly', function () {
        let state = new State(0);
        let listener1 = state.subscribe(() => { });
        expect(state.inUse).to.be.true;
        expect(state.hasSubscriber(listener1)).to.be.true;
    });
    it('Add two subscribers correctly', function () {
        let state = new State(0);
        let listener1 = state.subscribe(() => { });
        let listener2 = state.subscribe(() => { });
        expect(state.inUse).to.be.true;
        expect(state.hasSubscriber(listener1)).to.be.true;
        expect(state.hasSubscriber(listener2)).to.be.true;
    });
    it('Insert two subscribers then remove first listners correctly', function () {
        let state = new State(0);
        let listener1 = state.subscribe(() => { });
        let listener2 = state.subscribe(() => { });
        state.unsubscribe(listener1);
        expect(state.inUse).to.be.true;
        expect(state.hasSubscriber(listener1)).to.be.false;
        expect(state.hasSubscriber(listener2)).to.be.true;
    });
    it('Insert two subscribers then removeing both listners correctly', function () {
        let state = new State(0);
        let listener1 = state.subscribe(() => { });
        let listener2 = state.subscribe(() => { });
        state.unsubscribe(listener1);
        state.unsubscribe(listener2);
        expect(state.inUse).to.be.false;
        expect(state.hasSubscriber(listener1)).to.be.false;
        expect(state.hasSubscriber(listener2)).to.be.false;
    });
});

describe('State change with subscribers', function () {
    it('One subscribers', function (done) {
        let state = new State(0);
        state.subscribe((val) => { if (val === 10) { done() } else { done(new Error('Unexpected value')) } });
        state.set = 10;
    });
    it('Multiple subscribers', function () {
        let state = new State(0);
        let proms = Promise.all([
            new Promise((a) => { state.subscribe((val) => { a(0) }) }),
            new Promise((a) => { state.subscribe((val) => { a(0) }) }),
            new Promise((a) => { state.subscribe((val) => { a(0) }) }),
        ])
        state.set = 10;
        return proms;
    });
    it('subscribers with exception', function () {
        let state = new State(0);
        state.subscribe((val) => { throw false });
        state.set = 10;
    });
});

describe('Setting value silently', function () {
    it('One subscribers', function (done) {
        let state = new State(0);
        state.subscribe((val) => { done(new Error('Unexpected update')) });
        state.setSilent = 10;
        done()
    });
});

describe('Manual update call', function () {
    it('One subscribers', function (done) {
        let state = new State(0);
        state.subscribe((val) => { if (val === 10) { done() } else { done(new Error('Unexpected state')) } });
        state.update(10);
    });
});

describe('Update call with skip', function () {
    it('One subscribers', function (done) {
        let state = new State(0);
        let sub = state.subscribe((val) => { done(new Error('Unexpected state')) });
        state.updateSkip(10, sub);
        done()
    });
});

describe('Adding subscribers with initial update', function () {
    it('Add one subscribers correctly', function (done) {
        let state = new State(1);
        state.subscribe((val) => { if (val === 1) { done(); } else { done(new Error('State incorrect')) } }, true);
    });
    it('Add multiple subscribers correctly', function () {
        let state = new State(1);
        let proms = Promise.all([
            new Promise((a) => { state.subscribe((val) => { if (val === 1) { a(0); } }, true) }),
            new Promise((a) => { state.subscribe((val) => { if (val === 1) { a(0); } }, true) }),
            new Promise((a) => { state.subscribe((val) => { if (val === 1) { a(0); } }, true) }),
        ])
        return proms;
    });
});

describe('Methods and properties', function () {
    it('hasListener', function () {
        let state = new State(10);
        expect(state.inUse).equal(false);
        state.subscribe(() => { });
        expect(state.inUse).equal(true);
    });
    it('Compare same type', function () {
        let state = new State(10);
        expect(state.compare(10)).equal(false);
        expect(state.compare(11)).equal(true);
    });
    it('Compare different type', function () {
        let state = new State(10);
        expect(state.compare('10')).equal(true);
        expect(state.compare('11')).equal(true);
    });
    it('JSON override', function () {
        let state = new State(10);
        expect(JSON.stringify(state)).equal('10');
    });
    it('Info about state', function () {
        let state = new State(10);
        state.info = { name: 'Test' };
        expect(state.info).deep.equal({ name: 'Test' });
        state.info = { name: 'Test', description: 'TestDesc' };
        expect(state.info).deep.equal({ name: 'Test', description: 'TestDesc' });
    });
});

class StateTest<StateType> extends State<StateType> {
    /** This gets the current state*/
    get get(): StateType | Promise<StateType> {
        return new Promise((a) => {
            setTimeout(() => {
                a(this._value);
            }, 10);
        })
    }
}

describe('State with async getter', function () {
    it('State with async getter', function (done) {
        let state = new StateTest(10);
        let val = state.get;
        if (val instanceof Promise) {
            val.then((val) => {
                expect(val).equal(10);
                done();
            })
        }
    });
});

describe('State with single type must be able to be assignable to parameter with multiple types', function () {
    it('State with async getter', function () {
        let state = new State(10);
        let func = (val: StateLike<number | boolean>) => { return val }
        func(state);
    });
});

describe('State is compatible with async', function () {
    it('Awaiting state value', async function () {
        let state = new State(10);
        expect(await state).equal(10);
    });
});