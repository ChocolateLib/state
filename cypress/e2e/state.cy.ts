/// <reference types="cypress" />
import { State } from "../../src"

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

describe('Value', function () {
    it('Setting/Getting true', function () {
        let state = new State(false);
        expect(state.get).equal(false);
        state.set = true;
        expect(state.get).equal(true);
    });
    it('Setting/Getting 1', function () {
        let state = new State(0);
        expect(state.get).equal(0);
        state.set = 1;
        expect(state.get).equal(1);
    });
    it('Setting/Getting "test"', function () {
        let state = new State('');
        expect(state.get).equal('');
        state.set = 'test';
        expect(state.get).equal('test');
    });
    it('Setting/Getting an object', function () {
        let state = new State<number | {}>(0);
        expect(state.get).equal(0);
        state.set = {};
        expect(typeof state.get).equal('object');
    });
    it('Setting/Getting an array', function () {
        let state = new State<number | {}>(0);
        expect(state.get).equal(0);
        state.set = [];
        expect(state.get).instanceOf(Array);
    });

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
    it('Insert two subscribers then remove first subscribers correctly', function () {
        let state = new State(0);
        let listener1 = state.subscribe(() => { });
        let listener2 = state.subscribe(() => { });
        state.unsubscribe(listener1);
        expect(state.inUse).to.be.true;
        expect(state.hasSubscriber(listener1)).to.be.false;
        expect(state.hasSubscriber(listener2)).to.be.true;
    });
    it('Insert two subscribers then removeing both subscribers correctly', function () {
        let state = new State(0);
        let listener1 = state.subscribe(() => { });
        let listener2 = state.subscribe(() => { });
        state.unsubscribe(listener1);
        state.unsubscribe(listener2);
        expect(state.inUse).to.be.false;
        expect(state.hasSubscriber(listener1)).to.be.false;
        expect(state.hasSubscriber(listener2)).to.be.false;
    });

    it('Setting value with one subscribers', function (done) {
        let state = new State(0);
        state.subscribe((val) => { if (val === 10) { done() } else { done(new Error('Unexpected value')) } });
        state.set = 10;
    });
    it('Setting value with multiple subscribers', function () {
        let state = new State(0);
        let proms = Promise.all([
            new Promise((a) => { state.subscribe((val) => { a(0) }) }),
            new Promise((a) => { state.subscribe((val) => { a(0) }) }),
            new Promise((a) => { state.subscribe((val) => { a(0) }) }),
        ])
        state.set = 10;
        return proms;
    });
    it('Setting value with subscribers with exception', function () {
        let state = new State(0);
        state.subscribe((val) => { throw false });
        state.set = 10;
    });

    it('Setting value silently with one subscribers', function (done) {
        let state = new State(0);
        state.subscribe((val) => { done(new Error('Unexpected update')) });
        state.setSilent = 10;
        done()
    });

    it('Manual update call with one subscribers', function (done) {
        let state = new State(0);
        state.subscribe((val) => { if (val === 10) { done() } else { done(new Error('Unexpected state')) } });
        state.update(10);
    });

    it('Update call with skip of one subscribers', function (done) {
        let state = new State(0);
        let sub = state.subscribe((val) => { done(new Error('Unexpected state')) });
        state.updateSkip(10, sub);
        done()
    });

    it('Add one subscribers with update set true', function (done) {
        let state = new State(1);
        state.subscribe((val) => { if (val === 1) { done(); } else { done(new Error('State incorrect')) } }, true);
    });

    it('Add multiple subscribers with update set true', function () {
        let state = new State(1);
        let proms = Promise.all([
            new Promise((a) => { state.subscribe((val) => { if (val === 1) { a(0); } }, true) }),
            new Promise((a) => { state.subscribe((val) => { if (val === 1) { a(0); } }, true) }),
            new Promise((a) => { state.subscribe((val) => { if (val === 1) { a(0); } }, true) }),
        ])
        return proms;
    });

    it('inUse', function () {
        let state = new State(10);
        expect(state.inUse).equal(false);
        state.subscribe(() => { });
        expect(state.inUse).equal(true);
    });

    it('hasSubscriber', function () {
        let state = new State(10);
        let func = state.subscribe(() => { });
        expect(state.hasSubscriber(func)).equal(true);
    });
});

describe('Options', function () {
    it('State initial options', async function () {
        let options = { info: { name: 'YOYO' } }
        let state = new State(10, options);
        expect(state.info).equal(options.info);
    });
    it('State setting options', async function () {
        let options = { info: { name: 'YOYO' } }
        let state = new State(10, options);
        expect(state.info).equal(options.info);
        let options2 = { info: { name: 'PPPP' } }
        state.options = options2;
        expect(state.info).equal(options2.info);
    });

    it('Add one subscribers correctly', function () {
        let state = new State(0);
        let listener1 = state.subscribeOptions(() => { });
        expect(state.inUseOptions).to.be.true;
        expect(state.hasOptionsSubscriber(listener1)).to.be.true;
    });
    it('Add two subscribers correctly', function () {
        let state = new State(0);
        let listener1 = state.subscribeOptions(() => { });
        let listener2 = state.subscribeOptions(() => { });
        expect(state.inUseOptions).to.be.true;
        expect(state.hasOptionsSubscriber(listener1)).to.be.true;
        expect(state.hasOptionsSubscriber(listener2)).to.be.true;
    });
    it('Insert two subscribers then remove first subscribers correctly', function () {
        let state = new State(0);
        let listener1 = state.subscribeOptions(() => { });
        let listener2 = state.subscribeOptions(() => { });
        state.unsubscribeOptions(listener1);
        expect(state.inUseOptions).to.be.true;
        expect(state.hasOptionsSubscriber(listener1)).to.be.false;
        expect(state.hasOptionsSubscriber(listener2)).to.be.true;
    });
    it('Insert two subscribers then removeing both subscribers correctly', function () {
        let state = new State(0);
        let listener1 = state.subscribeOptions(() => { });
        let listener2 = state.subscribeOptions(() => { });
        state.unsubscribeOptions(listener1);
        state.unsubscribeOptions(listener2);
        expect(state.inUseOptions).to.be.false;
        expect(state.hasOptionsSubscriber(listener1)).to.be.false;
        expect(state.hasOptionsSubscriber(listener2)).to.be.false;
    });

    it('Setting value with one subscribers', function (done) {
        let state = new State(0);
        state.subscribeOptions((val) => { if (val === state) { done() } else { done(new Error('Unexpected value')) } });
        state.options = {};
    });
    it('Setting value with multiple subscribers', function () {
        let state = new State(0);
        let proms = Promise.all([
            new Promise((a) => { state.subscribeOptions((val) => { a(0) }) }),
            new Promise((a) => { state.subscribeOptions((val) => { a(0) }) }),
            new Promise((a) => { state.subscribeOptions((val) => { a(0) }) }),
        ])
        state.options = {};
        return proms;
    });
    it('Setting value with subscribers with exception', function () {
        let state = new State(0);
        state.subscribeOptions((val) => { throw false });
        state.options = {};
    });
    it('Add one subscribers with update set true', function (done) {
        let state = new State(1);
        state.subscribeOptions((val) => { if (val === state) { done(); } else { done(new Error('State incorrect')) } }, true);
    });
    it('Add multiple subscribers with update set true', function () {
        let state = new State(1);
        let proms = Promise.all([
            new Promise((a) => { state.subscribeOptions((val) => { if (val === state) { a(0); } }, true) }),
            new Promise((a) => { state.subscribeOptions((val) => { if (val === state) { a(0); } }, true) }),
            new Promise((a) => { state.subscribeOptions((val) => { if (val === state) { a(0); } }, true) }),
        ])
        return proms;
    });

    it('inUseOptions', function () {
        let state = new State(10);
        expect(state.inUseOptions).equal(false);
        state.subscribeOptions(() => { });
        expect(state.inUseOptions).equal(true);
    });
    it('hasOptionsSubscriber', function () {
        let state = new State(10);
        let func = state.subscribeOptions(() => { });
        expect(state.hasOptionsSubscriber(func)).equal(true);
    });
});

describe('Other', function () {
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
    it('Awaiting state', async function () {
        let state = new State(10);
        expect(await state).equal(10);
    });
    it('State as a type with multiple generics', function () {
        let state = new State(10);
        let func = (val: State<number | boolean>) => { return val }
        func(state);
    });
});

