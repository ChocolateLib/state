import { State, StateInfo, StateLike } from "./state";

/**Entry item for enum */
export type StateEnumEntry = {
    /**Name for entry */
    name: string,
    /**Description for entry */
    description?: string,
    /**Icon for entry */
    icon?: SVGSVGElement,
}

/**List of enum entries */
export type StateEnumList = {
    [key: string]: StateEnumEntry
}

/**Use this type when you want to have an argument StateLimited with multiple types, this example will only work with the ValueLimitedLike*/
export interface StateEnumLike<S extends StateEnumList> extends StateLike<keyof S> {
    /**Returns all enums*/
    get enums(): S
    /**Returns the values enums*/
    get enum(): S[keyof S]
    /**Returns the enum of a specific value*/
    getEnum(value: keyof S): S[keyof S]
    /**Checks if value is in enum list*/
    checkEnum(value: keyof S): boolean
}

/**State with a fixed set of values each with meta data
 * Two usage examples
 * 
 * Fixed symbols has typechecking for 
 * const enums = {
 *  'e1': { name: 'Enum 1' },
 *  'e2': { name: 'Enum 2' },
 * }
 * let stateEnum = new StateEnum('e1', enums);
 * 
 * Dynamic symbols
 * let enums: StateEnumList = {
 *  'e1': { name: 'Enum 1' },
 *  'e2': { name: 'Enum 2' },
 * }
 * let stateEnum = new StateEnum('e1', enums); */
export class StateEnum<S extends StateEnumList> extends State<keyof S> {
    private _enums: S;

    /**State with a fixed set of values each with meta data
     * @param init initial value of the Value
     * @param enums 
     * @param info metadata for state*/
    constructor(init: keyof S, enums: S, info?: StateInfo) {
        super(init, info);
        this._enums = enums;
    }

    /**Returns all enums*/
    get enums(): S {
        return this._enums;
    }

    /**Returns the values enums*/
    get enum(): S[keyof S] {
        return this._enums[this._value];
    }

    /**Returns the enum of a specific value*/
    getEnum(value: keyof S): S[keyof S] {
        return this._enums[value];
    }

    /**Checks if value is in enum list*/
    checkEnum(value: keyof S): boolean {
        if (!this._enums || value in this._enums) {
            return true;
        }
        return false;
    }

    /**This sets the value and dispatches an event*/
    set set(val: keyof S) {
        if (val !== this._value && this.checkEnum(val)) {
            this._value = val;
            this.update(val);
        }
    }
}