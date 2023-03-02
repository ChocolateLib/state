/// <reference types="cypress" />
import { StateNumber } from "../../src"

describe('Setup', function () {
    it('Should have an initial value of undefined', async function () {
        expect(await (new StateNumber())).equal(undefined);
    });
    it('Should have an initial value of 0', async function () {
        expect(await (new StateNumber(0))).equal(0);
    });
});

describe('Limiting', function () {
    it('Minimum is accessible', function () {
        expect((new StateNumber(5, { min: 2, max: 5 })).min).equal(2);
    });
    it('Maximum is accessible', function () {
        expect((new StateNumber(5, { max: 5 })).max).equal(5);
    });
    it('Step size is accessible', function () {
        expect((new StateNumber(5, { decimals: 6 })).decimals).equal(6);
    });
    it('Step size is accessible', function () {
        expect((new StateNumber(5, { step: { size: 0.1 } })).step).deep.equal({ size: 0.1 });
    });
})

describe('Limiting', function () {
    it('None limited number', async function () {
        let state = new StateNumber(5);
        expect(await state).equal(5);
        state.set = 100;
        expect(await state).equal(100);
        state.set = -100;
        expect(await state).equal(-100);
    });
    it('Limiter to numbers between 2 and 8', async function () {
        let value = new StateNumber(5, { min: 2, max: 8 });
        expect(await value).equal(5);
        value.set = 10;
        expect(await value).equal(8);
        value.set = 0;
        expect(await value).equal(2);
    });
});

describe('Step', function () {
    it('Step size 2', async function () {
        let state = new StateNumber(0, { step: { size: 2 } });
        state.set = 4;
        expect(await state).equal(4);
        state.set = 5.5;
        expect(await state).equal(6);
    });
    it('Step size 2 start 1', async function () {
        let state = new StateNumber(0, { step: { size: 2, start: 1 } });
        state.set = 3;
        expect(await state).equal(3);
        state.set = 5.5;
        expect(await state).equal(5);
    });
    it('Step size 0.12', async function () {
        let state = new StateNumber(0, { step: { size: 0.12 } });
        state.set = 3.96;
        expect(await state).equal(3.96);
        state.set = 5.5;
        expect(await state).equal(5.52);
    });
    it('Step size 0.12 start 0.3', async function () {
        let state = new StateNumber(0, { step: { size: 0.12, start: 0.3 } });
        state.set = 4.02;
        expect(await state).equal(4.02);
        state.set = 5.5;
        expect(await state).equal(5.46);
    });
    it('Step size 2 start 0.3', async function () {
        let state = new StateNumber(0, { step: { size: 2, start: 0.3 } });
        state.set = 2.3;
        expect(await state).equal(2.3);
        state.set = 5.5;
        expect(await state).equal(6.3);
    });
    it('Step size 2 start 0.3', async function () {
        let state = new StateNumber(0, { step: { size: 0.12, start: 2 } });
        state.set = 3.92;
        expect(await state).equal(3.92);
        state.set = 5.5;
        expect(await state).equal(5.48);
    });
    it('Step size 2 start 0.3', async function () {
        let state = new StateNumber(0, { step: { size: 0.012, start: 0.01 } });
        state.set = 1.198;
        expect(await state).equal(1.198);
        state.set = 2.2;
        expect(await state).equal(2.206);
    });
});