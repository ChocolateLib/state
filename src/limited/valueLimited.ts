import { State, StateLike } from "../state";

/**Function to listen for value changes */
export type LimiterListener<T> = (val: ValueLimited<T>) => void

/**Limiter struct */
export interface Limiter<T> {
    /**Limiter function, returns true to block value*/
    func(val: T): boolean,
    /**Reason for blocking value, can be used for interface*/
    reason: string | ((val: T) => string)
    /**Function to provide a correctional value if value is limited
     * eg. values 50-60 are blocked by a limiter, but if the value is set to 53 the value can be corrected to 50 instead of just being set back to its original value*/
    correction?: (val: T) => T
}

export interface LimitCheck<T> {
    /**Whether the value is allowed, true is allowed*/
    allowed: boolean,
    /**The reason for the value not being allowed*/
    reason: string,
    /**Correctional value, in case there is a similar but allowed value*/
    correction?: T
}

/**Use this type when you want to have an argument ValueLimited with multiple types, this example will only work with the ValueLimitedLike
 * let func = (val:ValueLimitedLike<number|string>)=>{return val}
 * let val = new ValueLimited<number>(1);
 * func(val) */
export interface ValueLimitedLike<T> extends StateLike<T> {
    addLimiterListener(func: LimiterListener<any>, run?: boolean): LimiterListener<any>
    removeLimiterListener(func: LimiterListener<any>): LimiterListener<any>
    get limiters()
    set limiters(limiters: Limiter<any>[] | undefined)
    checkLimit(val: T): boolean
    checkLimitReason(val: T): LimitCheck<T>
    set set(val: T)
}

/**Extension of Value class to allow limiting Value value*/
export class ValueLimited<T> extends State<T> {
    private ___limiters: Limiter<T>[] | undefined;
    private ___limitersListeners: LimiterListener<T>[] = [];

    /**Constructor
     * @param init initial value of the Value*/
    constructor(init: T, limiters?: Limiter<T>[]) {
        super(init)
        this.___limiters = limiters;
    }

    /**This adds a function as an listener for changes to the limiters
     * @param run set true to run listener with Values value instantly*/
    addLimiterListener(func: LimiterListener<T>, run?: boolean): LimiterListener<T> {
        this.___limitersListeners.push(func);
        if (run) {
            func(this);
        }
        return func;
    }

    /**This removes a function as an listener for changes to the limiters*/
    removeLimiterListener(func: LimiterListener<T>): LimiterListener<T> {
        let index = this.___limitersListeners.indexOf(func);
        if (index != -1) {
            this.___limitersListeners.splice(index, 1);
        }
        return func;
    }

    /** This sends an update without changing the value, can be used for more complex values*/
    protected ___updateLimiter() {
        if (this.___limitersListeners) {
            for (let i = 0, m = this.___limitersListeners.length; i < m; i++) {
                try {
                    this.___limitersListeners[i](this);
                } catch (e) {
                    console.warn('Failed while calling value listeners ', e);
                }
            }
        }
    }

    /**Returns the values limiters*/
    get limiters() {
        return this.___limiters
    }

    /**Changes the limiter structure*/
    set limiters(limiters: Limiter<T>[] | undefined) {
        if (limiters) {
            this.___limiters = limiters;
        } else {
            delete this.___limiters;
        }
        this.___updateLimiter();
    }

    /**Runs through limiters to check if value is allowed returns true if value is allowed*/
    checkLimit(val: T): boolean {
        if (this.___limiters) {
            for (let i = 0; i < this.___limiters.length; i++) {
                if (this.___limiters[i].func(val)) {
                    return false;
                }
            }
        }
        return true;
    }

    /**Runs through limiters to check if value is allowed*/
    checkLimitReason(val: T): LimitCheck<T> {
        if (this.___limiters) {
            for (let i = 0; i < this.___limiters.length; i++) {
                let limiter = this.___limiters[i];
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
        this.update();
    }
}