import { State, StateOptions } from "./state";

export interface StateNumberStep {
    /**Size of steps, eg 2 means 2,4,6,8 are allowed*/
    size: number,
    /**Step start, eg with size 1 and start 0.2, 0.2,1.2,2.2 are allowed */
    start?: number,
}

export interface StateNumberOptions extends StateOptions {
    min?: number;
    max?: number;
    decimals?: number;
    step?: StateNumberStep;
}

/**State for representing a number with a limited range/precision*/
export class StateNumber extends State<number | undefined> {
    /**State for representing a number with a limited range/precision*/
    constructor(init?: number, options?: StateNumberOptions) {
        super(init);
        if (options) {
            this.options = options;
        }
    }

    /**Minimum allowed value */
    readonly min: number = -Infinity;
    /**Maximum allowed value */
    readonly max: number = Infinity;
    /**Intended amount of decimals */
    readonly decimals: number = 0;
    /**Value step */
    readonly step: StateNumberStep | undefined;

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

    /**Options of state number */
    set options(options: StateNumberOptions) {
        if (typeof options.min === 'number') {
            //@ts-expect-error
            this.min = options.min;
        }
        if (typeof options.max === 'number') {
            //@ts-expect-error
            this.max = options.max;
        }
        if (typeof options.decimals === 'number') {
            //@ts-expect-error
            this.decimals = Math.max(options.decimals, 0);
        }
        if (options.step) {
            //@ts-expect-error
            this.step = options.step;
        }
        super.options = options;
    }
}

