/// <reference types="cypress" />
import { StateNumber } from "../../src"

describe('Initial valueLimiter should not limit initial value', function () {
    it('Should have an initial value of undefined', function () {
        expect((new StateNumber()).get).equal(undefined);
    });
    it('Should have an initial value of 0', function () {
        expect((new StateNumber(0)).get).equal(0);
    });
});

describe('Limiting', function () {
    it('Minimum is accessible', function () {
        expect((new StateNumber(5, 2, 5)).min).equal(2);
    });
    it('Maximum is accessible', function () {
        expect((new StateNumber(5, 2, 5)).max).equal(5);
    });
    it('Step size is accessible', function () {
        expect((new StateNumber(5, 2, 5, 6)).decimals).equal(6);
    });
    it('Step size is accessible', function () {
        expect((new StateNumber(5, 2, 5, 6, { size: 0.1 })).step).deep.equal({ size: 0.1 });
    });
})

describe('Limiting', function () {
    it('None limited number', function () {
        let state = new StateNumber(5);
        expect(state.get).equal(5);
        state.set = 100;
        expect(state.get).equal(100);
        state.set = -100;
        expect(state.get).equal(-100);
    });
    it('Limiter to numbers between 2 and 8', function () {
        let value = new StateNumber(5, 2, 8);
        expect(value.get).equal(5);
        value.set = 10;
        expect(value.get).equal(8);
        value.set = 0;
        expect(value.get).equal(2);
    });
});

describe('Step', function () {
    it('Step size 2', function () {
        let state = new StateNumber(0, undefined, undefined, undefined, { size: 2 });
        state.set = 4;
        expect(state.get).equal(4);
        state.set = 5.5;
        expect(state.get).equal(6);
    });
    it('Step size 2 start 1', function () {
        let state = new StateNumber(0, undefined, undefined, undefined, { size: 2, start: 1 });
        state.set = 3;
        expect(state.get).equal(3);
        state.set = 5.5;
        expect(state.get).equal(5);
    });
    it('Step size 0.12', function () {
        let state = new StateNumber(0, undefined, undefined, undefined, { size: 0.12 });
        state.set = 3.96;
        expect(state.get).equal(3.96);
        state.set = 5.5;
        expect(state.get).equal(5.52);
    });
    it('Step size 0.12 start 0.3', function () {
        let state = new StateNumber(0, undefined, undefined, undefined, { size: 0.12, start: 0.3 });
        state.set = 4.02;
        expect(state.get).equal(4.02);
        state.set = 5.5;
        expect(state.get).equal(5.46);
    });
    it('Step size 2 start 0.3', function () {
        let state = new StateNumber(0, undefined, undefined, undefined, { size: 2, start: 0.3 });
        state.set = 2.3;
        expect(state.get).equal(2.3);
        state.set = 5.5;
        expect(state.get).equal(6.3);
    });
    it('Step size 2 start 0.3', function () {
        let state = new StateNumber(0, undefined, undefined, undefined, { size: 0.12, start: 2 });
        state.set = 3.92;
        expect(state.get).equal(3.92);
        state.set = 5.5;
        expect(state.get).equal(5.48);
    });
    it('Step size 2 start 0.3', function () {
        let state = new StateNumber(0, undefined, undefined, undefined, { size: 0.012, start: 0.01 });
        state.set = 1.198;
        expect(state.get).equal(1.198);
        state.set = 2.2;
        expect(state.get).equal(2.206);
    });
});