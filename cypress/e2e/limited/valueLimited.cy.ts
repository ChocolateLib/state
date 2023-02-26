/// <reference types="cypress" />
import { ValueLimited, ValueLimitedLike } from "../../../src"

describe('Limited Value', function () {
    describe('Initial valueLimiter should not limit initial value', function () {
        it('Should have an initial value of null', function () {
            expect((new ValueLimited(null, [{ func(val) { return false }, reason: '' }])).get).equal(null);
        });
        it('Should have an initial value of true', function () {
            expect((new ValueLimited(true, [{ func(val) { return false }, reason: '' }])).get).equal(true);
        });
        it('Should have an initial value of 1', function () {
            expect((new ValueLimited(1, [{ func(val) { return false }, reason: '' }])).get).equal(1);
        });
        it('Should have an initial value of "test"', function () {
            expect((new ValueLimited('test', [{ func(val) { return false }, reason: '' }])).get).equal('test');
        });
        it('Should have an initial value type of an object', function () {
            expect(typeof (new ValueLimited<{} | boolean>({}, [{ func(val) { return false }, reason: '' }])).get).equal('object');
        });
        it('Should have an initial value type of an array', function () {
            expect((new ValueLimited<[] | boolean>([], [{ func(val) { return false }, reason: '' }])).get).instanceOf(Array);
        });
    });

    describe('Value limiter', function () {
        it('Single limiter', function () {
            let value = new ValueLimited(1, [{ func(val) { return val === 10 }, reason: 'Not valid' }]);
            value.set = 2;
            expect(value.get).equal(2);
            value.set = 10;
            expect(value.get).equal(2);
            expect(value.checkLimitReason(8)).deep.equal({ allowed: true, reason: '' });
            expect(value.checkLimitReason(10)).deep.equal({ allowed: false, reason: 'Not valid' });
        });
        it('Multiple limiter', function () {
            let value = new ValueLimited(1, [{ func(val) { return val === 10 }, reason: 'Ten' }, { func(val) { return val === 16 }, reason: 'Sixteen' }]);
            value.set = 3;
            expect(value.get).equal(3);
            value.set = 10;
            expect(value.get).equal(3);
            expect(value.checkLimitReason(10)).deep.equal({ allowed: false, reason: 'Ten' });
            value.set = 16;
            expect(value.get).equal(3);
            expect(value.checkLimitReason(16)).deep.equal({ allowed: false, reason: 'Sixteen' });
        });
        it('Correctional value', function () {
            let value = new ValueLimited(1, [{ func(val) { return val === 10 }, reason: 'Ten', correction(val) { return val + 1 } }, { func(val) { return val === 16 }, reason: 'Sixteen', correction(val) { return val + 2 }, }]);
            value.set = 3;
            expect(value.get).equal(3);
            value.set = 10;
            expect(value.get).equal(3);
            expect(value.checkLimitReason(10)).deep.equal({ allowed: false, reason: 'Ten', correction: 11 });
            value.set = 16;
            expect(value.get).equal(3);
            expect(value.checkLimitReason(16)).deep.equal({ allowed: false, reason: 'Sixteen', correction: 18 });
        });
    });


    describe('Value with single type must be able to be assignable to parameter with multiple types', function () {
        it('Value with async getter', function () {
            let value = new ValueLimited(10);
            let func = (val: ValueLimitedLike<number | boolean>) => { return val }
            func(value);
        });
    });
});