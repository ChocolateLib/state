import { State, StateInfo, StateLike, StateOptions } from "./state";

export type StateEnumEntry = {
    name: string,
    description?: string,
    icon?: SVGSVGElement,
}

export type StateEnumList = {
    [key: string]: StateEnumEntry
}

/**Use this type when you want to have an argument StateLimited with multiple types, this example will only work with the ValueLimitedLike*/
export interface StateEnumLike<S extends StateEnumList> extends StateLike<keyof S> {
    /**Returns the values enums*/
    get enum(): S[keyof S] | undefined
    /**Returns the enum of a specific value*/
    getEnum(value: keyof S): S[keyof S]
    /**Returns all enums*/
    get getEnums(): S
    /**Checks if value is in enum list*/
    checkInEnum(value: keyof S): boolean
}

export interface StateEnumOptions<T extends StateEnumList> extends StateOptions {
    enums?: T,
    placeholder?: StateEnumEntry,
}

/**State with a fixed set of values each with meta data
 * Two usage examples
 * 
 * Fixed symbols has typechecking for 
 * const enums = {
 *  'e1': { name: 'Enum 1' },
 *  'e2': { name: 'Enum 2' },
 * }
 * It is a good idea to freze the enum
 * Object.freeze(enums);
 * let stateEnum = new StateEnum('e1', enums);
 * 
 * Dynamic symbols
 * let enums: StateEnumList = {
 *  'e1': { name: 'Enum 1' },
 *  'e2': { name: 'Enum 2' },
 * }
 * let stateEnum = new StateEnum('e1', enums); */
export class StateEnum<T extends StateEnumList> extends State<keyof T | undefined> {
    /**State with a fixed set of values each with meta data
     * Two usage examples
     * 
     * Fixed symbols has typechecking for 
     * const enums = {
     *  'e1': { name: 'Enum 1' },
     *  'e2': { name: 'Enum 2' },
     * }
     * It is a good idea to freze the enum
     * Object.freeze(enums);
     * let stateEnum = new StateEnum('e1', enums);
     * 
     * Dynamic symbols
     * let enums: StateEnumList = {
     *  'e1': { name: 'Enum 1' },
     *  'e2': { name: 'Enum 2' },
     * }
     * let stateEnum = new StateEnum('e1', enums);*/
    constructor(enums: T, init?: keyof T, options?: StateEnumOptions<T>) {
        super(init);
        this.enums = enums;
        if (options) {
            this.options = options;
        }
    }

    /**Placeholder for when state value is undefined */
    readonly placeholder: StateEnumEntry | undefined;

    /**Enums struct */
    readonly enums: T;

    /**Returns the values enums*/
    get enum(): T[keyof T] | undefined {
        return this.enums[<keyof T>this._value] || this.placeholder;
    }

    /**Returns the enum of a specific value*/
    getEnum(value: keyof T): T[keyof T] {
        return this.enums[value];
    }

    /**Checks if value is in enum list*/
    checkInEnum(value: keyof T): boolean {
        if (!this.enums || value in this.enums) {
            return true;
        }
        return false;
    }

    /**This sets the value and dispatches an event*/
    set set(val: keyof T) {
        if (val !== this._value && this.checkInEnum(val)) {
            this._value = val;
            this.update(val);
        }
    }

    /**Options of state */
    set options(options: StateEnumOptions<T>) {
        if (options.enums) {
            //@ts-expect-error
            this.enums = options.enums;
        }
        if (options.placeholder) {
            //@ts-expect-error
            this.placeholder = options.placeholder;
        }
        super.options = options;
    }
}