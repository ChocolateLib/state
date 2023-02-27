import { stringByteLimit } from "@chocolatelib/string";
import { StateLimiter, StateLimited } from "./stateLimited";

/**Extension of Value class to allow limiting Value value*/
export class StateString extends StateLimited<string> {
    private _regEx: RegExp | undefined;
    private _maxLength: number | undefined;
    private _maxByteLength: number | undefined;

    /**Constructor
     * @param init initial value of the Value
     * @param maxLength the maximum character length of the string
     * @param maxByteLength the maximum byte length of the string
     * @param allowed list of allowed values for string*/
    constructor(init: string, maxLength?: number, maxByteLength?: number, regEx?: RegExp, limiters?: StateLimiter<string>[]) {
        super(init, limiters);
        this._regEx = regEx;
        this._maxLength = maxLength;
        this._maxByteLength = maxByteLength;
    }

    /** This sets the value and dispatches an event*/
    set set(val: string) {
        if (this._maxLength && val.length > this._maxLength) {
            val = val.slice(0, this._maxLength);
        }
        if (this._maxByteLength) {
            val = stringByteLimit(val, this._maxByteLength);
        }
        if (this._regEx && !this._regEx.test(val)) {
            return;
        }
        if (val !== this._value && this.checkLimit(val)) {
            this._value = val;
            this.update(val);
        }
    }
}