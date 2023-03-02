/// <reference types="cypress" />
import { State, StateLink } from "../../src"

describe('Initial value', function () {
    it('Can be initialized without arguments', function () {
        new StateLink();
    });
    it('Can be initialized with multiple Values', function () {
        new StateLink([new State(1), new State(2), new State(3)]);
    });
    it('Can be initialized with multiple Values of different types function', function () {
        new StateLink([new State<boolean | number | string>(true), new State<boolean | number | string>(2), new State<boolean | number | string>('3')]);
    });
});

describe('Linking values', function () {
    it('Linking initialized values', async function () {
        let values = [new State(1), new State(2), new State(3)];
        let link = new StateLink(values);
        link.link();
        expect(values[0].inUse).equal(true);
        expect(await values[0]).equal(1);
        expect(values[1].inUse).equal(true);
        expect(await values[1]).equal(1);
        expect(values[2].inUse).equal(true);
        expect(await values[2]).equal(1);
    });
    it('Linking initialized values then changing value', async function () {
        let values = [new State(1), new State(2), new State(3)];
        let link = new StateLink(values);
        link.link();
        expect(await values[0]).equal(1);
        expect(await values[1]).equal(1);
        expect(await values[2]).equal(1);
        values[0].set = 2
        expect(await values[0]).equal(2);
        expect(await values[1]).equal(2);
        expect(await values[2]).equal(2);
        values[1].set = 3
        expect(await values[0]).equal(3);
        expect(await values[1]).equal(3);
        expect(await values[2]).equal(3);
        values[2].set = 4
        expect(await values[0]).equal(4);
        expect(await values[1]).equal(4);
        expect(await values[2]).equal(4);
    });
    it('Linking then unlinking values', async function () {
        let values = [new State(1), new State(2), new State(3)];
        let link = new StateLink(values);
        link.link();
        expect(values[0].inUse).equal(true);
        expect(values[1].inUse).equal(true);
        expect(values[2].inUse).equal(true);
        link.unlink();
        expect(values[0].inUse).equal(false);
        expect(values[1].inUse).equal(false);
        expect(values[2].inUse).equal(false);
    });
    it('Linking initialized values with link set to true', async function () {
        let values = [new State(1), new State(2), new State(3)];
        let link = new StateLink(values, true);
        expect(values[0].inUse).equal(true);
        expect(await values[0]).equal(1);
        expect(values[1].inUse).equal(true);
        expect(await values[1]).equal(1);
        expect(values[2].inUse).equal(true);
        expect(await values[2]).equal(1);
    });
    it('Linking initialized values then setting values to undefined', async function () {
        let values = [new State(1), new State(2), new State(3)];
        let link = new StateLink(values, true);
        expect(values[0].inUse).equal(true);
        expect(await values[0]).equal(1);
        expect(values[1].inUse).equal(true);
        expect(await values[1]).equal(1);
        expect(values[2].inUse).equal(true);
        expect(await values[2]).equal(1);
        link.states();
        expect(values[0].inUse).equal(false);
        expect(values[1].inUse).equal(false);
        expect(values[2].inUse).equal(false);
    });
});
