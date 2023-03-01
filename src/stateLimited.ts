import { State, StateOptions } from "./state";

/**Limiter struct */
export interface StateLimiter<T> {
    /**Limiter function, returns true to block value*/
    func(val: T): boolean,
    /**Reason for blocking value, can be used for user interface*/
    reason: string | ((val: T) => string)
    /**Function to provide a correctional value if value is limited
     * eg. values 50-60 are blocked by a limiter, but if the value is set to 53 the value can be corrected to 50 instead of just being set back to its original value*/
    correction?: (val: T) => T
}

export interface StateLimitCheck<T> {
    /**Whether the value is allowed, true is allowed*/
    allowed: boolean,
    /**The reason for the value not being allowed*/
    reason: string,
    /**Correctional value, in case there is a similar but allowed value*/
    correction?: T
}

export interface StateLimitedOptions<T> extends StateOptions {
    limiters?: StateLimiter<T>[]
}

/**State with arbritary limits for value */
export class StateLimited<T> extends State<T> {
    readonly limiters: StateLimiter<T>[] | undefined;

    /**Constructor*/
    constructor(init: T, options?: StateLimitedOptions<T>) {
        super(init)
        if (options) {
            this.options = options;
        }
    }

    /**Runs through limiters to check if value is allowed returns true if value is allowed*/
    checkLimit(val: T): boolean {
        if (this.limiters) {
            for (let i = 0; i < this.limiters.length; i++) {
                if (this.limiters[i].func(val)) {
                    return false;
                }
            }
        }
        return true;
    }

    /**Runs through limiters to check if value is allowed*/
    checkLimitReason(val: T): StateLimitCheck<T> {
        if (this.limiters) {
            for (let i = 0; i < this.limiters.length; i++) {
                const limiter = this.limiters[i];
                if (limiter.func(val)) {
                    if (limiter.correction) {
                        switch (typeof limiter.reason) {
                            case 'string': return { allowed: false, reason: limiter.reason, correction: limiter.correction(val) };
                            case 'function': return { allowed: false, reason: limiter.reason(val), correction: limiter.correction(val) };
                        }
                    } else {
                        switch (typeof limiter.reason) {
                            case 'string': return { allowed: false, reason: limiter.reason };
                            case 'function': return { allowed: false, reason: limiter.reason(val) };
                        }
                    }
                }
            }
        }
        return { allowed: true, reason: '' };
    }

    /** This sets the value and dispatches an event*/
    set set(val: T) {
        if (val === this._value || !this.checkLimit(val)) {
            return;
        }
        this._value = val;
        this.update(val);
    }

    /**Options of state */
    set options(options: StateLimitedOptions<T>) {
        if (options.limiters) {
            //@ts-expect-error
            this.limiters = options.limiters;
        }
        super.options = options;
    }
}