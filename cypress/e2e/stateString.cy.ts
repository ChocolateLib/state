/// <reference types="cypress" />
import { StateString, StateStringLimits } from "../../src"

describe('Initial state', function () {
    it('Creating a state with initial value', async function () {
        let state = new StateString('2');
        expect(await state).equal('2');
    });
});

describe('Setting state value', function () {
    it('From owner context', async function () {
        let state = new StateString('2');
        expect(await state).equal('2');
        state.set('4')
        expect(await state).equal('4');
    });
    it('From user context with no setter function', async function () {
        let state = new StateString('2');
        expect(await state).equal('2');
        state.write('4')
        expect(await state).equal('2');
    });
    it('From user context with standard setter function', async function () {
        let state = new StateString('2', true);
        expect(await state).equal('2');
        state.set('4')
        expect(await state).equal('4');
    });
    it('From user context with custom function', async function () {
        let state = new StateString('2', (val, state) => { state.set(val + '2'); });
        expect(await state).equal('2');
        state.write('4')
        expect(await state).equal('42');
    });
});

describe('Getting state value', async function () {
    it('Using await', async function () {
        let state = new StateString('2');
        expect(await state).equal('2');
    });
    it('Using then', function (done) {
        let state = new StateString('2');
        state.then((val) => {
            expect(val).equal('2');
            done()
        })
    });
    it('Using then with chaining return', function (done) {
        let state = new StateString('2');
        state.then((val) => {
            expect(val).equal('2');
            return 8;
        }).then((val) => {
            expect(val).equal(8);
            done()
        })
    });
    it('Using then with chaining throw', function (done) {
        let state = new StateString('2');
        state.then((val) => {
            expect(val).equal('2');
            throw 8;
        }).then(() => { }, (val) => {
            expect(val).equal(8);
            done()
        })
    });
    it('Using then with async chaining return', function (done) {
        let state = new StateString('2');
        state.then(async (val) => {
            await new Promise((a) => { setTimeout(a, 10) });
            expect(val).equal('2');
            return 8;
        }).then((val) => {
            expect(val).equal(8);
            done()
        })
    });
    it('Using then with async chaining throw', function (done) {
        let state = new StateString('2');
        state.then(async (val) => {
            await new Promise((a) => { setTimeout(a, 10) });
            expect(val).equal('2');
            throw 8;
        }).then(() => { }, (val) => {
            expect(val).equal(8);
            done()
        })
    });
});


describe('Value subscriber', function () {
    it('Add one subscribers with update set true', function () {
        let state = new StateString('2');
        state.subscribe((value) => { }, true);
    });
    it('Add one subscribers with update set true', function () {
        let state = new StateString('2');
        state.subscribe((value) => { expect(value).equal('2'); }, true);
    });
    it('Add two subscribers with update set true', async function () {
        let state = new StateString('2');
        let values = await Promise.all([
            new Promise<string>((a) => { state.subscribe(a, true) }),
            new Promise<string>((a) => { state.subscribe(a, true) }),
        ])
        expect(values).deep.equal(['2', '2']);
    });
    it('Insert two subscribers then remove first subscribers', function (done) {
        let state = new StateString('2');
        let func = state.subscribe(() => { }, true);
        state.subscribe(() => { done() }, false);
        expect(state.inUse()).deep.equal(true);
        state.unsubscribe(func);
        expect(state.inUse()).deep.equal(true);
        state.set('4')
    });
    it('Insert two subscribers then removeing both subscribers', function (done) {
        let state = new StateString('2');
        let sum = 0
        let func1 = state.subscribe(() => { done('Should not be called') }, false);
        let func2 = state.subscribe(() => { done('Should not be called') }, false);
        expect(state.inUse()).deep.equal(true);
        state.unsubscribe(func1);
        state.unsubscribe(func2);
        expect(state.inUse()).deep.equal(false);
        state.set('4')
        done();
    });
    it('Setting value with one subscribers', function (done) {
        let state = new StateString('2');
        state.subscribe((val) => { done() }, false);
        state.set('10');
    });
    it('Setting value with multiple subscribers', async function () {
        let state = new StateString('2');
        let sum = ''
        state.subscribe((val) => { sum += val }, true)
        state.subscribe((val) => { sum += val }, true)
        state.subscribe((val) => { sum += val }, true)
        state.set('10');
        expect(sum).equal('222101010');
    });
    it('Setting value with subscribers with exception', function () {
        let state = new StateString('2');
        state.subscribe((val) => { throw false }, false);
        state.set('10');
    });
});

describe('Number limits', function () {
    it('Max length', async function () {
        let state = new StateString('2', true, new StateStringLimits(5));
        expect(await state).equal('2');
        state.write('1')
        expect(await state).equal('1');
        state.write('999999')
        expect(await state).equal('99999');
    });
    it('Max bytes', async function () {
        let state = new StateString('2', true, new StateStringLimits(99, 40));
        expect(await state).equal('2');
        state.write('1')
        expect(await state).equal('1');
        state.write('æøæøæøæøæøæøæøæøæøæøæøæøæøæøæøæøæøæøæøæøæ')
        expect(await state).equal('æøæøæøæøæøæøæøæøæøæø');
    });
});