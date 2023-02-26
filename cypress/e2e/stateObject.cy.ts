/// <reference types="cypress" />
import { State, StateObjectFixed } from "../../src"

describe('Value', function () {
    describe('Initial value', function () {
        it('Should have an initial value of null', function () {
            let obj = { member1: new State(1) };
            expect((new StateObjectFixed(obj)).get).equal(obj);
        });
    });

    describe('Setting value', function () {
        it('Setting value to true', function () {
            let obj = { member1: new State(1) };
            let obj2 = { member1: new State(1) };
            let value = new StateObjectFixed(obj);
            value.set = obj2;
            expect(value.get).equal(obj2);
        });
        it('Setting member value to true', function () {
            let obj = { member1: new State(1) };
            let value = new StateObjectFixed(obj);
            value.getKey('member1').set = 2;
            expect(value.getKey('member1').get).equal(2);
        });
        it('Setting member', function () {
            let obj = { member1: new State(1) };
            let value = new StateObjectFixed(obj);
            value.setKey('member1', new State(2));
            expect(value.getKey('member1').get).equal(2);
        });
    });

    describe('Getting value', function () {
        it('Getting member value', function () {
            let obj = { member1: new State(1) };
            let value = new StateObjectFixed(obj);
            expect(value.getKey('member1').get).equal(1);
        });
    });

    describe('Adding and removing listener', function () {
        it('Add one listener correctly', function () {
            let obj = { member1: new State(1) };
            let value = new StateObjectFixed(obj);
            let listener1 = value.addSubValueListener(() => { });
            expect(value.inUseSubValue).to.be.true;
            expect(value.hasSubValueListener(listener1)).to.be.true;
        });
        it('Add two listeners correctly', function () {
            let obj = { member1: new State(1) };
            let value = new StateObjectFixed(obj);
            let listener1 = value.addSubValueListener(() => { });
            let listener2 = value.addSubValueListener(() => { });
            expect(value.inUseSubValue).to.be.true;
            expect(value.hasSubValueListener(listener1)).to.be.true;
            expect(value.hasSubValueListener(listener2)).to.be.true;
        });
        it('Insert two listeners then remove first listners correctly', function () {
            let obj = { member1: new State(1) };
            let value = new StateObjectFixed(obj);
            let listener1 = value.addSubValueListener(() => { });
            let listener2 = value.addSubValueListener(() => { });
            value.removeSubValueListener(listener1);
            expect(value.inUseSubValue).to.be.true;
            expect(value.hasSubValueListener(listener1)).to.be.false;
            expect(value.hasSubValueListener(listener2)).to.be.true;
        });
        it('Insert two listeners then removeing both listners correctly', function () {
            let obj = { member1: new State(1) };
            let value = new StateObjectFixed(obj);
            let listener1 = value.addSubValueListener(() => { });
            let listener2 = value.addSubValueListener(() => { });
            value.removeSubValueListener(listener1);
            value.removeSubValueListener(listener2);
            expect(value.inUseSubValue).to.be.false;
            expect(value.hasSubValueListener(listener1)).to.be.false;
            expect(value.hasSubValueListener(listener2)).to.be.false;
        });
    });

    describe('Value change with listeners', function () {
        it('One listener', function (done) {
            let obj = { member1: new State(1) };
            let value = new StateObjectFixed(obj);
            value.addSubValueListener((val) => { if (val === value) { done() } else { done(new Error('Unexpected value')) } });
            obj.member1.set = 10;
        });
        it('Multiple listener', function () {
            let obj = { member1: new State(1) };
            let value = new StateObjectFixed(obj);
            let proms = Promise.all([
                new Promise((a) => { value.addSubValueListener((val) => { a(0) }) }),
                new Promise((a) => { value.addSubValueListener((val) => { a(0) }) }),
                new Promise((a) => { value.addSubValueListener((val) => { a(0) }) }),
            ])
            obj.member1.set = 10;
            return proms;
        });
        it('Listener with exception', function () {
            let obj = { member1: new State(1) };
            let value = new StateObjectFixed(obj);
            value.addSubValueListener((val) => { throw false });
            obj.member1.set = 10;
        });
    });


    describe('Methods and properties', function () {
        it('hasListener', function () {
            let obj = { member1: new State(1) };
            let value = new StateObjectFixed(obj);
            expect(value.inUseSubValue).equal(false);
            value.addSubValueListener(() => { });
            expect(value.inUseSubValue).equal(true);
        });
        it('Compare same type', function () {
            let obj = { member1: new State(1) };
            let value = new StateObjectFixed(obj);
            expect(value.compare(10)).equal(true);
            expect(value.compare(11)).equal(true);
        });
        it('Compare different type', function () {
            let obj = { member1: new State(1) };
            let value = new StateObjectFixed(obj);
            expect(value.compare('10')).equal(true);
            expect(value.compare('11')).equal(true);
        });
        it('JSON override', function () {
            let obj = { member1: new State(1) };
            let value = new StateObjectFixed(obj);
            expect(JSON.stringify(value)).equal('{"member1":1}');
        });
        it('Info about value', function () {
            let obj = { member1: new State(1) };
            let value = new StateObjectFixed(obj);
            value.info = { name: 'Test' };
            expect(value.info).deep.equal({ name: 'Test' });
            value.info = { name: 'Test', description: 'TestDesc' };
            expect(value.info).deep.equal({ name: 'Test', description: 'TestDesc' });
        });
    });
});