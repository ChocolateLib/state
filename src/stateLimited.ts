import { State, StateInfo, StateLike } from "./state";

/**Limiter struct */
export interface StateLimiter<T> {
    /**Limiter function, returns true to block value*/
    func(val: T): boolean,
    /**Reason for blocking value, can be used for interface*/
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

/**Use this type when you want to have an argument StateLimited with multiple types, this example will only work with the ValueLimitedLike*/
export interface StateLimitedLike<T> extends StateLike<T> {
    checkLimit(val: T): boolean
    checkLimitReason(val: T): StateLimitCheck<T>
}

/**State with limits */
export class StateLimited<T> extends State<T> {
    private _limits: StateLimiter<T>[] | undefined;

    /**Constructor
     * @param init initial value of the Value*/
    constructor(init: T, limiters?: StateLimiter<T>[], info?: StateInfo) {
        super(init, info)
        this._limits = limiters;
    }

    /**Runs through limiters to check if value is allowed returns true if value is allowed*/
    checkLimit(val: T): boolean {
        if (this._limits) {
            for (let i = 0; i < this._limits.length; i++) {
                if (this._limits[i].func(val)) {
                    return false;
                }
            }
        }
        return true;
    }

    /**Runs through limiters to check if value is allowed*/
    checkLimitReason(val: T): StateLimitCheck<T> {
        if (this._limits) {
            for (let i = 0; i < this._limits.length; i++) {
                let limiter = this._limits[i];
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
}