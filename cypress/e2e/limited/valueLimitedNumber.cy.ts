/// <reference types="cypress" />
import { ValueLimitedNumber } from "../../../src"

describe('Limited Number Value', function () {
    describe('Initial valueLimiter should not limit initial value', function () {
        it('Should have an initial value of 0', function () {
            expect((new ValueLimitedNumber(0)).get).equal(0);
        });
    });

    describe('Limiting', function () {
        it('Minimum is accessible', function () {
            expect((new ValueLimitedNumber(5, 2, 5)).min).equal(2);
        });
        it('Maximum is accessible', function () {
            expect((new ValueLimitedNumber(5, 2, 5)).max).equal(5);
        });
        it('Step size is accessible', function () {
            expect((new ValueLimitedNumber(5, 2, 5, 6)).step).equal(6);
        });
    })


    describe('Limiting', function () {
        it('None limited number', function () {
            let value = new ValueLimitedNumber(5);
            expect(value.get).equal(5);
            value.set = 100;
            expect(value.get).equal(100);
            value.set = -100;
            expect(value.get).equal(-100);
        });
        it('Limiter to numbers between 2 and 8', function () {
            let value = new ValueLimitedNumber(5, 2, 8);
            expect(value.get).equal(5);
            value.set = 10;
            expect(value.get).equal(8);
            value.set = 0;
            expect(value.get).equal(2);
        });
        it('Limiter to steps of 3', function () {
            let value = new ValueLimitedNumber(5, undefined, undefined, 3);
            expect(value.get).equal(5);
            value.set = 10;
            expect(value.get).equal(9);
            value.set = 0;
            expect(value.get).equal(0);
        });
        it('Limiter to steps of 3 and between 5 and 44', function () {
            let value = new ValueLimitedNumber(5, 5, 44, 3);
            expect(value.get).equal(5);
            value.set = 2;
            expect(value.get).equal(5);
            value.set = 40;
            expect(value.get).equal(39);
        });
        it('Limiter to steps of 0.1 and between 0 and 100', function () {
            let value = new ValueLimitedNumber(0, 0, 100, 0.1);
            value.set = 1.225;
            expect(value.decimals).equal(1);
            expect(value.get).equal(1.2);
        });
    });

    describe('Change limits', function () {
        it('Minimum is changed', function () {
            let value = new ValueLimitedNumber(20, 5, 600, 3);
            expect(value.get).equal(20);
            value.min = 38;
            expect(value.get).equal(38);
        });
        it('Maximum is changed', function () {
            let value = new ValueLimitedNumber(500, 5, 600, 3);
            expect(value.get).equal(500);
            value.max = 357;
            expect(value.get).equal(357);
        });
        it('Step size is set', function () {
            let value = new ValueLimitedNumber(20, 5, 600);
            expect(value.get).equal(20);
            value.step = 7;
            value.set = 20;
            expect(value.get).equal(21);
        });
        it('Step size is changed', function () {
            let value = new ValueLimitedNumber(21, 5, 600, 7);
            expect(value.get).equal(21);
            value.step = 8;
            value.set = 21;
            expect(value.get).equal(24);
        });
        it('Step size is removed', function () {
            let value = new ValueLimitedNumber(21, 5, 600, 7);
            expect(value.get).equal(21);
            value.step = undefined;
            value.set = 23;
            expect(value.get).equal(23);
        });
    });
});