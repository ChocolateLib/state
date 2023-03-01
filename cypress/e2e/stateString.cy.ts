/// <reference types="cypress" />
import { StateString } from "../../src"

describe('Setup', function () {
    it('Initial value of test', function () {
        expect((new StateString('test')).get).equal('test');
    });
    it('Max length is accessible', function () {
        expect((new StateString('asdf', { maxLength: 10 })).maxLength).equal(10);
    });
    it('Max byte length is accessible', function () {
        expect((new StateString('asdf', { maxByteLength: 22 })).maxByteLength).equal(22);
    });
});

describe('Limits', function () {
    it('Limiting character length to 10', function () {
        let value = new StateString('asdf', { maxLength: 10 });
        value.set = '123456789011';
        expect(value.get).equal('1234567890');
        value.set = 'æøæøæøæøæøæø';
        expect(value.get).equal('æøæøæøæøæø');
    });
    it('Limiting length to 10 bytes', function () {
        let value = new StateString('asdf', { maxByteLength: 10 });
        value.set = 'æøæøæøæøæøæø';
        expect(value.get).equal('æøæøæ');
    });
});