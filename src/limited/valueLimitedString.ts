import { stringByteLimit } from "@chocolatelib/string";
import { Limiter, ValueLimited } from "./valueLimited";

/**Entry item for enum */
export type EnumEntry = {
    /**Name for entry */
    name: string,
    /**Description for entry */
    description?: string,
    /**Icon for entry */
    icon?: SVGSVGElement,
}

/**List of enum entries */
export type EnumList = {
    [key: string]: EnumEntry
}


/**Extension of Value class to allow limiting Value value*/
export class ValueLimitedString extends ValueLimited<string> {
    private _maxLength: number | undefined;
    private _maxByteLength: number | undefined;
    private ___enums: EnumList | undefined;

    /**Constructor
     * @param init initial value of the Value
     * @param maxLength the maximum character length of the string
     * @param maxByteLength the maximum byte length of the string
     * @param allowed list of allowed values for string*/
    constructor(init: string, enums?: EnumList, maxLength?: number, maxByteLength?: number, limiters?: Limiter<string>[]) {
        super(init, limiters);
        this._maxLength = maxLength;
        this._maxByteLength = maxByteLength;
        this.___enums = enums;
    }

    /**Returns the values enums*/
    get enums() {
        return this.___enums;
    }

    /**Changes the values enums */
    set enums(enums: EnumList | undefined) {
        if (enums) {
            this.___enums = enums;
            if (!this.checkEnum(this._value)) {
                for (const key in this.___enums) {
                    this._value = key;
                    this.update();
                    return
                }
            }
        } else {
            delete this.___enums;
        }
        this.___updateLimiter();
    }

    /**Returns the values enums*/
    get enum() {
        if (this.___enums) {
            return this.___enums[this._value];
        }
        return undefined;
    }

    /**Checks if value is in enum list*/
    checkEnum(val: string) {
        if (!this.___enums || val in this.___enums) {
            return true;
        }
        return false;
    }


    /**Returns max length*/
    get maxLength() {
        return this._maxLength;
    }
    /**Changes max length of string*/
    set maxLength(maxLength: number | undefined) {
        this._maxLength = maxLength;
        if (this._maxLength && this._value.length > this._maxLength) {
            this._value = this._value.slice(0, this._maxLength);
            this.update();
        }
        this.___updateLimiter();
    }

    /**Returns max byte length*/
    get maxByteLength() {
        return this._maxByteLength;
    }
    /**Changes max byte length of string*/
    set maxByteLength(maxByteLength: number | undefined) {
        this._maxByteLength = maxByteLength;
        if (this._maxByteLength) {
            let val = stringByteLimit(this._value, this._maxByteLength);
            if (this._value !== val) {
                this._value = val;
                this.update();
            }
        }
        this.___updateLimiter();
    }


    /** This sets the value and dispatches an event*/
    set set(val: string) {
        if (this._maxLength && val.length > this._maxLength) {
            val = val.slice(0, this._maxLength);
        }
        if (this._maxByteLength) {
            val = stringByteLimit(val, this._maxByteLength);
        }
        if (val !== this._value && this.checkLimit(val) && this.checkEnum(val)) {
            this._value = val;
            this.update();
        }
    }

    /** This sets the value without checking limits and dispatches an event*/
    set setUnchecked(val: string) {
        super.set = val;
    }
}