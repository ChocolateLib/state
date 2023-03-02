/// <reference types="cypress" />
import { StateLimited } from "../../src"

describe('Setup', function () {
    it('Initial value of true', async function () {
        expect(await (new StateLimited(true))).equal(true);
    });
    it('Limiters set', async function () {
        let limiters = [{ func(val) { return false }, reason: '' }];
        let state = new StateLimited(1, { limiters });
        expect(await state).equal(1);
        expect(state.limiters).equal(limiters);
    });
});

describe('Limiter', function () {
    it('Single limiter', async function () {
        let value = new StateLimited(1, { limiters: [{ func(val) { return val === 10 }, reason: 'Not valid' }] });
        value.set = 2;
        expect(await value).equal(2);
        value.set = 10;
        expect(await value).equal(2);
        expect(value.checkLimitReason(8)).deep.equal({ allowed: true, reason: '' });
        expect(value.checkLimitReason(10)).deep.equal({ allowed: false, reason: 'Not valid' });
    });
    it('Multiple limiter', async function () {
        let value = new StateLimited(1, { limiters: [{ func(val) { return val === 10 }, reason: 'Ten' }, { func(val) { return val === 16 }, reason: 'Sixteen' }] });
        value.set = 3;
        expect(await value).equal(3);
        value.set = 10;
        expect(await value).equal(3);
        expect(value.checkLimitReason(10)).deep.equal({ allowed: false, reason: 'Ten' });
        value.set = 16;
        expect(await value).equal(3);
        expect(value.checkLimitReason(16)).deep.equal({ allowed: false, reason: 'Sixteen' });
    });
    it('Correctional value', async function () {
        let value = new StateLimited(1, { limiters: [{ func(val) { return val === 10 }, reason: 'Ten', correction(val) { return val + 1 } }, { func(val) { return val === 16 }, reason: 'Sixteen', correction(val) { return val + 2 }, }] });
        value.set = 3;
        expect(await value).equal(3);
        value.set = 10;
        expect(await value).equal(3);
        expect(value.checkLimitReason(10)).deep.equal({ allowed: false, reason: 'Ten', correction: 11 });
        value.set = 16;
        expect(await value).equal(3);
        expect(value.checkLimitReason(16)).deep.equal({ allowed: false, reason: 'Sixteen', correction: 18 });
    });
});


describe('Other', function () {
    it('State as a type with multiple generics', function () {
        let value = new StateLimited(10);
        let func = (val: StateLimited<number | boolean>) => { return val }
        func(value);
    });
});