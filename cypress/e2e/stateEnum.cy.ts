/// <reference types="cypress" />
import { StateEnum, StateEnumList } from "../../src"

describe('Defining state enum', function () {
    it('Enum can be initialized with a fixed selection and without initial value', function () {
        const enums = { 'e1': { name: 'Enum 1' }, 'e2': { name: 'Enum 2' }, }
        new StateEnum(enums);
    });
    it('Enum can be initialized with a fixed selection with initial value', function () {
        const enums = { 'e1': { name: 'Enum 1' }, 'e2': { name: 'Enum 2' }, }
        let state = new StateEnum(enums, 'e1');
        expect(state.get).equal('e1');
    });
    it('Enum can be initialized with a dynamic selection and without initial value', function () {
        let enums: StateEnumList = { 'e1': { name: 'Enum 1' }, 'e2': { name: 'Enum 2' }, }
        new StateEnum(enums);
    });
    it('Enum can be initialized with a fixed selection with initial value', function () {
        let enums: StateEnumList = { 'e1': { name: 'Enum 1' }, 'e2': { name: 'Enum 2' }, }
        let state = new StateEnum(enums, 'e1');
        expect(state.get).equal('e1');
    });
});

describe('Enum information', function () {
    it('Enums selection can be retrieved from enum', function () {
        const enums = { 'e1': { name: 'Enum 1' }, 'e2': { name: 'Enum 2' }, }
        let state = new StateEnum(enums);
        expect(state.enums).equal(enums);
    });
    it('Specific enum entry can be retrived', function () {
        const enums = { 'e1': { name: 'Enum 1' }, 'e2': { name: 'Enum 2' }, }
        let state = new StateEnum(enums);
        expect(state.getEnum('e1')).equal(enums.e1);
    });
    it('Without initial value and placeholder unset, current enum is undefined', function () {
        const enums = { 'e1': { name: 'Enum 1' }, 'e2': { name: 'Enum 2' }, }
        let state = new StateEnum(enums);
        expect(state.enum).equal(undefined);
    });
    it('Without initial value and placeholder set, current enum is placeholder', function () {
        const enums = { 'e1': { name: 'Enum 1' }, 'e2': { name: 'Enum 2' }, }
        const placeholder = { name: 'Test' };
        let state = new StateEnum(enums, undefined, { placeholder });
        expect(state.enum).equal(placeholder);
    });
    it('With initial value and placeholder unset, current enum is selected enum', function () {
        const enums = { 'e1': { name: 'Enum 1' }, 'e2': { name: 'Enum 2' }, }
        let state = new StateEnum(enums, 'e1');
        expect(state.enum).equal(enums.e1);
    });
    it('With initial value and placeholder set, current enum is selected enum', function () {
        const enums = { 'e1': { name: 'Enum 1' }, 'e2': { name: 'Enum 2' }, }
        const placeholder = { name: 'Test' };
        let state = new StateEnum(enums, 'e1', { placeholder });
        expect(state.enum).equal(enums.e1);
    });
})

describe('Enum Check', function () {
    it('Enum with a fixed selection can check if an entry exists', function () {
        const enums = { 'e1': { name: 'Enum 1' }, 'e2': { name: 'Enum 2' }, }
        let state = new StateEnum(enums);
        expect(state.checkInEnum("e1")).equal(true);
        //@ts-expect-error
        expect(state.checkInEnum("e3")).equal(false);
    });
    it('Enum with a dynamic selection can check if an entry exists', function () {
        let enums: StateEnumList = { 'e1': { name: 'Enum 1' }, 'e2': { name: 'Enum 2' }, }
        let state = new StateEnum(enums);
        expect(state.checkInEnum("e1")).equal(true);
        expect(state.checkInEnum("e3")).equal(false);
    });
});

describe('Enum setting', function () {
    it('When setting enum value it will only allow valid selections', function () {
        let enums: StateEnumList = { 'e1': { name: 'Enum 1' }, 'e2': { name: 'Enum 2' }, }
        let state = new StateEnum(enums);
        state.set = 'e1';
        expect(state.get).equal('e1');
        state.set = 'e3';
        expect(state.get).equal('e1');
        state.set = 'e2';
        expect(state.get).equal('e2');
    });
});
