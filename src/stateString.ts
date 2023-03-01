import { State, StateOptions } from "./state";

export interface StateStringOptions extends StateOptions {
    maxLength?: number,
    maxByteLength?: number,
}

/**State representing a string value*/
export class StateString extends State<string | undefined> {
    /**State representing a string value*/
    constructor(init: string, options?: StateStringOptions) {
        super(init);
        if (options) {
            this.options = options;
        }
    }

    /**Maximum character lenght of string*/
    readonly maxLength: number | undefined;

    /**Maximum byte length of string*/
    readonly maxByteLength: number | undefined;

    /** This sets the value and dispatches an event*/
    set set(value: string) {
        if (value !== this._value) {
            if (this.maxLength && value.length > this.maxLength) {
                value = value.slice(0, this.maxLength);
            }
            if (this.maxByteLength) {
                value = (new TextDecoder).decode((new TextEncoder).encode(value).slice(0, this.maxByteLength));
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

    /**Options of state */
    set options(options: StateStringOptions) {
        if (options.maxLength) {
            //@ts-expect-error
            this.maxLength = options.maxLength;
        }
        if (options.maxByteLength) {
            //@ts-expect-error
            this.maxByteLength = options.maxByteLength;
        }
        super.options = options;
    }
}