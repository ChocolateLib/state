import { State, StateInfo } from "./state";




/**State representing a string value*/
export class StateString extends State<string | undefined> {
    private _maxLength: number | undefined;
    private _maxByteLength: number | undefined;

    /**Constructor
     * @param init initial value of the Value
     * @param maxLength the maximum character length of the string
     * @param maxByteLength the maximum byte length of the string*/
    constructor(init: string, maxLength?: number, maxByteLength?: number, info?: StateInfo) {
        super(init, info);
        this._maxLength = maxLength;
        this._maxByteLength = maxByteLength;
    }

    options(options: { info?: StateInfo, asdf: number }) {

    }

    /** This sets the value and dispatches an event*/
    set set(value: string) {
        if (value !== this._value) {
            if (this._maxLength && value.length > this._maxLength) {
                value = value.slice(0, this._maxLength);
            }
            if (this._maxByteLength) {
                let encoder = new TextEncoder().encode(value);
                value = new TextDecoder().decode(encoder.slice(0, this._maxByteLength));
                if (value.at(-1)?.charCodeAt(0) === 65533) {
                    value = value.slice(0, -1);
                }
            }
            if (value !== this._value) {
                this._value = value;
                this.update(value);
            }
        }
    }
}