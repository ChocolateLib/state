import { State, StateInfo, StateLike } from "./state";

/**Defines the allowed step of the StateNumber */
export interface StateNumberStep {
    /**Size of steps, eg 2 means 2,4,6,8 are allowed*/
    size: number,
    /**Step start, eg  */
    start?: number,
}

/**Use this type when you want to have an argument StateLimited with multiple types, this example will only work with the ValueLimitedLike*/
export interface StateNumberLike extends StateLike<number | undefined> {
    readonly min: number;
    readonly max: number;
    readonly decimals: number;
    readonly step: StateNumberStep | undefined;
}

/**State for representing a number with a limited range/precision*/
export class StateNumber extends State<number | undefined> {
    readonly min: number;
    readonly max: number;
    readonly decimals: number = 0;
    readonly step: StateNumberStep | undefined;

    /**State for representing a number with a limited range/precision
     * @param init initial value
     * @param min minimum allowed value
     * @param max maximum allowed value
     * @param decimals amount of segnificant decimals for the value
     * @param step definition of allowed step of number eg, 0.3,0.5,0.7*/
    constructor(init?: number, min: number = -Infinity, max: number = Infinity, decimals: number = 0, step?: StateNumberStep, info?: StateInfo) {
        super(init, info);
        this.min = min;
        this.max = max;
        this.decimals = decimals;
        this.step = step;
    }

    /** This sets the value and dispatches an event*/
    set set(value: number) {
        if (value !== this._value) {
            if (this.step) {
                if (this.step.start) {
                    value = (Math.round((value - this.step.start) / this.step.size)) * this.step.size + this.step.start;
                } else {
                    value = (Math.round(value / this.step.size)) * this.step.size;
                }
            }
            value = Math.min(this.max, Math.max(this.min, value));
            if (value !== this._value) {
                this._value = value;
                this.update(value);
            }
        }
    }
}

