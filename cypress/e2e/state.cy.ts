/// <reference types="cypress" />
import { createState } from "../../src"

describe('Initial state', function () {
    it('Creating a state with no initial value', async function () {
        let { state, set } = createState(undefined);
        expect(await state).equal(undefined);
    });
    it('Creating a state with initial value', async function () {
        let { state, set } = createState(2);
        expect(await state).equal(2);
    });
});

describe('Setting state value', function () {
    it('From owner context', async function () {
        let { state, set } = createState(2);
        expect(await state).equal(2);
        set(4)
        expect(await state).equal(4);
    });
    it('From user context with no setter function', async function () {
        let { state, set } = createState(2);
        expect(await state).equal(2);
        state.set(4)
        expect(await state).equal(2);
    });
    it('From user context with standard setter function', async function () {
        let { state, set } = createState(2, true);
        expect(await state).equal(2);
        state.set(4)
        expect(await state).equal(4);
    });
    it('From user context with custom function', async function () {
        let { state, set, } = createState(2, (val) => { set(val * 2); });
        expect(await state).equal(2);
        state.set(4)
        expect(await state).equal(8);
    });
});

describe('Getting state value', async function () {
    it('Using await', async function () {
        let { state, set } = createState(2);
        expect(await state).equal(2);
    });
    it('Using then', function (done) {
        let { state, set } = createState(2);
        state.then((val) => {
            expect(val).equal(2);
            done()
        })
    });
    it('Using then with chaining return', function (done) {
        let { state, set } = createState(2);
        state.then((val) => {
            expect(val).equal(2);
            return 8;
        }).then((val) => {
            expect(val).equal(8);
            done()
        })
    });
    it('Using then with chaining throw', function (done) {
        let { state, set } = createState(2);
        state.then((val) => {
            expect(val).equal(2);
            throw 8;
        }).then(() => { }, (val) => {
            expect(val).equal(8);
            done()
        })
    });
    it('Using then with async chaining return', function (done) {
        let { state, set } = createState(2);
        state.then(async (val) => {
            await new Promise((a) => { setTimeout(a, 10) });
            expect(val).equal(2);
            return 8;
        }).then((val) => {
            expect(val).equal(8);
            done()
        })
    });
    it('Using then with async chaining throw', function (done) {
        let { state, set } = createState(2);
        state.then(async (val) => {
            await new Promise((a) => { setTimeout(a, 10) });
            expect(val).equal(2);
            throw 8;
        }).then(() => { }, (val) => {
            expect(val).equal(8);
            done()
        })
    });
});


describe('Value subscriber', function () {
    it('Add one subscribers with update set true', function () {
        let { state, set } = createState(2);
        state.subscribe((value) => { expect(value).equal(2); });
    });
    it('Add two subscribers with update set true', async function () {
        let { state, set } = createState(2);
        let values = await Promise.all([
            new Promise<number>((a) => { state.subscribe(a) }),
            new Promise<number>((a) => { state.subscribe(a) }),
        ])
        expect(values).deep.equal([2, 2]);
    });
    it('Insert two subscribers then remove first subscribers', function () {
        let { state, set } = createState(2);
        let sum = 0
        let func = state.subscribe(() => { sum++ });
        state.subscribe(() => { sum++ });
        state.unsubscribe(func);
        set(4)
        expect(sum).equal(3);
    });
    it('Insert two subscribers then removeing both subscribers', function () {
        let { state, set } = createState(2);
        let sum = 0
        let func1 = state.subscribe(() => { sum++ });
        let func2 = state.subscribe(() => { sum++ });
        state.unsubscribe(func1);
        state.unsubscribe(func2);
        set(4)
        expect(sum).equal(2);
    });
    it('Setting value with one subscribers', function () {
        let { state, set } = createState(2);
        let sum = 0
        state.subscribe((val) => { sum += val });
        set(10);
        expect(sum).equal(12);
    });
    it('Setting value with multiple subscribers', async function () {
        let { state, set } = createState(2);
        let sum = 0
        state.subscribe((val) => { sum += val })
        state.subscribe((val) => { sum += val })
        state.subscribe((val) => { sum += val })
        set(10);
        expect(sum).equal(36);
    });
    it('Setting value with subscribers with exception', function () {
        let { state, set } = createState(2);
        state.subscribe((val) => { throw false });
        set(10);
    });
});