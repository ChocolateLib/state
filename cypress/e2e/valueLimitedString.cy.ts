/// <reference types="cypress" />
import { ValueLimitedString } from "../../../src"

describe('Limited Number Value', function () {
    describe('Initial valueLimiter should not limit initial value', function () {
        it('Should have an initial value of 0', function () {
            expect((new ValueLimitedString('0')).get).equal('0');
        });
    });

    describe('Limiting', function () {
        it('Max length is accessible', function () {
            expect((new ValueLimitedString('asdf', undefined, 10)).maxLength).equal(10);
        });
        it('Max byte length is accessible', function () {
            expect((new ValueLimitedString('asdf', undefined, undefined, 22)).maxByteLength).equal(22);
        });
        it('Allowed list is accessible', function () {
            expect((new ValueLimitedString('asdf', { test1: { name: 'Test 1' }, test2: { name: 'Test 2' } })).enums).deep.equal({ test1: { name: 'Test 1' }, test2: { name: 'Test 2' } });
        });
    })


    describe('Limiting length', function () {
        it('Limiting length to 10', function () {
            let value = new ValueLimitedString('asdf', undefined, 10);
            value.set = '123456789011';
            expect(value.get).equal('1234567890');
            value.set = 'æøæøæøæøæøæø';
            expect(value.get).equal('æøæøæøæøæø');
        });
        it('Limiting length to 10 bytes', function () {
            let value = new ValueLimitedString('asdf', undefined, undefined, 10);
            value.set = 'æøæøæøæøæøæø';
            expect(value.get).equal('æøæøæ');
        });
    });

    describe('Enums', function () {
        it('Getting description', function () {
            let value = new ValueLimitedString('test1', { test1: { name: 'Test 1', description: 'Test1' }, test2: { name: 'Test 2', description: 'Test2' } })
            expect(value.enum).deep.equal({ name: 'Test 1', description: 'Test1' });
            value.set = 'test2';
            expect(value.enum).deep.equal({ name: 'Test 2', description: 'Test2' });
        });
        it('Changing enums with overlapping enums', function () {
            let value = new ValueLimitedString('test1', { test1: { name: 'Test 1', description: 'Test1' }, test2: { name: 'Test 2', description: 'Test2' } })
            expect(value.enum).deep.equal({ name: 'Test 1', description: 'Test1' });
            value.set = 'test2';
            value.enums = { test2: { name: 'Test 2', description: 'Test2' }, test3: { name: 'Test 3', description: 'Test3' } }
            value.set = 'test3';
            expect(value.enum).deep.equal({ name: 'Test 3', description: 'Test3' });
        });
        it('Changing enums with different enums', function () {
            let value = new ValueLimitedString('test1', { test1: { name: 'Test 1', description: 'Test1' }, test2: { name: 'Test 2', description: 'Test2' } })
            expect(value.enum).deep.equal({ name: 'Test 1', description: 'Test1' });
            value.set = 'test2';
            value.enums = { test3: { name: 'Test 3', description: 'Test3' }, test4: { name: 'Test 4', description: 'Test4' } }
            expect(value.get).deep.equal('test3');
            expect(value.enum).deep.equal({ name: 'Test 3', description: 'Test3' });
        });
    });
});