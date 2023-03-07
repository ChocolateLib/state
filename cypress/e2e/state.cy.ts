/// <reference types="cypress" />
import { createState } from "../../src"

describe('Initial state', function () {
    it('Creating a state with no initial value', async function () {
        let { state, set, setOptions } = createState();
        expect(await state).equal(undefined);
    });
    it('Creating a state with initial value', async function () {
        let { state, set, setOptions } = createState(2);
        expect(await state).equal(2);
    });
});

describe('Setting state value', function () {
    it('From owner context', async function () {
        let { state, set, setOptions } = createState(2);
        expect(await state).equal(2);
        set(4)
        expect(await state).equal(4);
    });
    it('From user context with standard function and writable set false', async function () {
        let { state, set, setOptions } = createState(2, true);
        expect(await state).equal(2);
        state.set(4)
        expect(await state).equal(2);
    });
    it('From user context with standard function and writable set true', async function () {
        let { state, set, setOptions } = createState(2, true, { writeable: true });
        expect(await state).equal(2);
        state.set(4)
        expect(await state).equal(4);
    });
    it('From user context with custom function and writable set false', async function () {
        let { state, set, setOptions } = createState(2, (val) => {
            set(val * 2);
        });
        expect(await state).equal(2);
        state.set(4)
        expect(await state).equal(2);
    });
    it('From user context with custom function and writable set true', async function () {
        let { state, set, setOptions } = createState(2, (val) => {
            set(val * 2);
        }, { writeable: true });
        expect(await state).equal(2);
        state.set(4)
        expect(await state).equal(8);
    });
});

describe('Getting state value', function () {
    it('Using get', async function () {
        let { state, set, setOptions } = createState(2);
        expect(state.get()).equal(2);
    });
    it('Using await', async function () {
        let { state, set, setOptions } = createState(2);
        expect(await state).equal(2);
    });
    it('Using then', function (done) {
        let { state, set, setOptions } = createState(2);
        state.then((val) => {
            expect(val).equal(2);
            done()
        })
    });
    it('Using then with chaining return', function (done) {
        let { state, set, setOptions } = createState(2);
        state.then((val) => {
            expect(val).equal(2);
            return 8;
        }).then((val) => {
            expect(val).equal(8);
            done()
        })
    });
    it('Using then with chaining throw', function (done) {
        let { state, set, setOptions } = createState(2);
        state.then((val) => {
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
        let { state, set, setOptions } = createState(2);
        state.subscribe((value) => { expect(value).equal(2); }, true);
    });
    it('Add two subscribers with update set true', async function () {
        let { state, set, setOptions } = createState(2);
        let values = await Promise.all([
            new Promise<number>((a) => { state.subscribe(a, true) }),
            new Promise<number>((a) => { state.subscribe(a, true) }),
        ])
        expect(values).deep.equal([2, 2]);
    });
    it('Insert two subscribers then remove first subscribers', function (done) {
        let { state, set, setOptions } = createState(2);
        let func = state.subscribe(() => { done('Fail') });
        state.subscribe(() => { done() });
        state.unsubscribe(func);
        set(4)
    });
    it('Insert two subscribers then removeing both subscribers', function (done) {
        let { state, set, setOptions } = createState(2);
        let func1 = state.subscribe(() => { done('Fail') });
        let func2 = state.subscribe(() => { done('Fail') });
        state.unsubscribe(func1);
        state.unsubscribe(func2);
        set(4)
        done()
    });
    it('Setting value with one subscribers', function (done) {
        let { state, set, setOptions } = createState(2);
        state.subscribe((val) => { done((val === 10 ? undefined : 'Unexpected value')) });
        set(10);
    });
    it('Setting value with multiple subscribers', async function () {
        let { state, set, setOptions } = createState(2);
        let values = Promise.all([
            new Promise<number>((a) => { state.subscribe(a) }),
            new Promise<number>((a) => { state.subscribe(a) }),
            new Promise<number>((a) => { state.subscribe(a) }),
        ])
        set(10);
        expect(await values).deep.equal([10, 10, 10]);
    });
    it('Setting value with subscribers with exception', function () {
        let { state, set, setOptions } = createState(2);
        state.subscribe((val) => { throw false });
        set(10);
    });
});


describe('Options', function () {
    it('Initial options set', function () {
        let options = {
            name: 'Test',
            description: '',
            icon: () => { return document.createElementNS('http://www.w3.org/2000/svg', 'svg') },
            writeable: false,
        }
        let { state, set, setOptions } = createState(2, undefined, options);
        expect(state.options).equal(options);
    });
    it('Setting options', function () {
        let options = {
            name: 'Test',
            description: '',
            writeable: false,
        }
        let { state, set, setOptions } = createState(2, undefined, options);
        expect(state.options).equal(options);
        setOptions({ name: 'Test2' })
        expect(state.options?.name).equal('Test2');
        expect(state.options).deep.equal({ name: 'Test2', description: '', writeable: false, });
    });

    it('Add one subscribers with update set true', function () {
        let options = { name: 'Test', description: '', writeable: false, }
        let { state, set, setOptions } = createState(2, undefined, options);
        state.subscribeOptions((value) => { expect(value).equal(options); }, true);
    });
    it('Add two subscribers with update set true', async function () {
        let options = { name: 'Test', description: '', writeable: false, }
        let { state, set, setOptions } = createState(2, undefined, options);
        let values = await Promise.all([
            new Promise((a) => { state.subscribeOptions(a, true) }),
            new Promise((a) => { state.subscribeOptions(a, true) }),
        ])
        expect(values).deep.equal([options, options]);
    });
    it('Insert two subscribers then remove first subscribers', function (done) {
        let options = { name: 'Test', description: '', writeable: false, }
        let { state, set, setOptions } = createState(2, undefined, options);
        let func = state.subscribeOptions(() => { done('Fail') });
        state.subscribeOptions(() => { done() });
        state.unsubscribeOptions(func);
        setOptions({ name: 'aa' })
    });
    it('Insert two subscribers then removeing both subscribers', function (done) {
        let options = { name: 'Test', description: '', writeable: false, }
        let { state, set, setOptions } = createState(2, undefined, options);
        let func1 = state.subscribeOptions(() => { done('Fail') });
        let func2 = state.subscribeOptions(() => { done('Fail') });
        state.unsubscribeOptions(func1);
        state.unsubscribeOptions(func2);
        setOptions({ name: 'Yo' })
        done()
    });
    it('Setting value with one subscribers', function (done) {
        let options = { name: 'Test', description: '', writeable: false, }
        let { state, set, setOptions } = createState(2, undefined, options);
        state.subscribeOptions((val) => {
            expect(val).deep.equal({ name: 'Yo' });
            done()
        });
        setOptions({ name: 'Yo' })
    });
    it('Setting value with multiple subscribers', async function () {
        let options = { name: 'Test', description: '', writeable: false, }
        let { state, set, setOptions } = createState(2, undefined, options);
        let values = Promise.all([
            new Promise((a) => { state.subscribeOptions(a) }),
            new Promise((a) => { state.subscribeOptions(a) }),
            new Promise((a) => { state.subscribeOptions(a) }),
        ])
        setOptions({ name: 'Yo' })
        expect(await values).deep.equal([{ name: 'Yo' }, { name: 'Yo' }, { name: 'Yo' }]);
    });
    it('Setting value with subscribers with exception', function () {
        let options = { name: 'Test', description: '', writeable: false, }
        let { state, set, setOptions } = createState(2, undefined, options);
        state.subscribeOptions((val) => { throw false });
        setOptions({ name: 'Yo' })
    });
});