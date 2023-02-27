import { StateLimiter, StateLimited } from "./stateLimited";

/**Extension of Value class to allow a limited number*/
export class StateNumber extends StateLimited<number> {
    private _min: number;
    private _max: number;
    private _step: number | undefined;
    private _halfStep: number = 0;
    /**Decimals is always has the same amount of decimals as the step size*/
    readonly decimals: number = 0;

    /**Constructor
     * @param init initial value of the Value
     * @param min minimum allowed value
     * @param max maximum allowed value
     * @param step step increment value must fall on eg 2 allows increments of 2 so 0,2,4,6 etc.*/
    constructor(init: number, min: number = -Infinity, max: number = Infinity, step?: number, limiters?: StateLimiter<number>[]) {
        super(init, limiters);
        this._min = min;
        this._max = max;
        if (step) {
            this._step = step;
            this._halfStep = step / 2;
            let split = step.toString().split('.')[1];
            this.decimals = (step < 1e+14 ? (split ? split.length : 0) : 0);
        }
    }

    /** This sets the value and dispatches an event*/
    set set(val: number) {
        if (this._step) {
            let mod = val % this._step;
            val = Number((mod > this._halfStep ? val + (this._step - mod) : val - mod).toFixed(this.decimals));
        }
        val = Math.min(this._max, Math.max(this._min, val));
        if (val !== this._value && this.checkLimit(val)) {
            this._value = val;
            this.update(val);
        }
    }

    /** This sets the value without checking limits and dispatches an event*/
    set setUnchecked(val: number) {
        super.set = val;
    }
}

