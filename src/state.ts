import { StateNumberLimits, StateStringLimits } from "./helpers";
import { StateBase } from "./stateBase";
import { StateChecker, StateInfo, StateLimiter, StateWrite } from "./types";

/**Function called when user sets value*/
export type StateSetter<R, W extends R = R> = (value: W, set: State<R, W>) => void

export class State<R, W extends R = R> extends StateBase<R> implements StateWrite<R, W>, StateInfo<R> {
    /**Creates a state which holds a value
     * @param init initial value for state, use undefined to indicate that state does not have a value yet
     * @param setter function called when state value is set via setter, set true let state set it's own value 
     * @param checker function to allow state users to check if a given value is valid for the state
     * @param limiter function to allow state users to limit a given value to state limit */
    constructor(init: R, setter?: StateSetter<R, W> | boolean, checker?: StateChecker<W>, limiter?: StateLimiter<W>) {
        super();
        if (setter)
            this._setter = (setter === true ? this.set : setter);
        if (checker)
            this._check = checker;
        if (limiter)
            this._limit = limiter;
        this._value = init;
    }

    private _value: R;
    private _setter: StateSetter<R, W> | undefined;
    private _check: StateChecker<W> | undefined;
    private _limit: StateLimiter<W> | undefined;

    //Read
    async then<TResult1 = R>(func: ((value: R) => TResult1 | PromiseLike<TResult1>)): Promise<TResult1> {
        return await func(this._value);
    }

    //Write
    write(value: W): void {
        if (this._setter && this._value !== value) {
            this._setter(value, this);
        }
    }
    check(value: W): string | undefined {
        return (this._check ? this._check(value) : undefined)
    }

    limit(value: W): W {
        return (this._limit ? this._limit(value) : value);
    }

    //Owner
    set(value: R) {
        this._value = value;
        this._updateSubscribers(value);
    }
}

export class StateNumber extends StateBase<number> implements StateWrite<number>, StateInfo<number> {
    /**Creates a state which holds a number
     * @param init initial value for state, use undefined to indicate that state does not have a value yet
     * @param limiter limiter struct to limit number*/
    constructor(init: number, limiter?: StateNumberLimits) {
        super();
        if (limiter)
            this._limit = limiter;
        this._value = init;
    }

    private _value: number;
    private _limit: StateNumberLimits | undefined;

    //Read
    async then<TResult1 = number>(func: ((value: number) => TResult1 | PromiseLike<TResult1>)): Promise<TResult1> {
        return await func(this._value);
    }

    //Write
    write(value: number): void {
        if (this._value !== value) {
            value = (this._limit ? this._limit.limit(value) : value);
            if (this._value !== value)
                this.set(value);
        }
    }
    check(value: number): string | undefined {
        return (this._limit ? this._limit.check(value) : undefined)
    }

    limit(value: number): number {
        return (this._limit ? this._limit.limit(value) : value);
    }

    //Owner
    set(value: number) {
        this._value = value;
        this._updateSubscribers(value);
    }
}

export class StateString extends StateBase<string> implements StateWrite<string>, StateInfo<string> {
    /**Creates a state which holds a string
     * @param init initial value for state, use undefined to indicate that state does not have a value yet
     * @param limiter limiter struct to limit string*/
    constructor(init: string, limiter?: StateStringLimits) {
        super();
        if (limiter)
            this._limit = limiter;
        this._value = init;
    }

    private _value: string;
    private _limit: StateStringLimits | undefined;

    //Read
    async then<TResult1 = string>(func: ((value: string) => TResult1 | PromiseLike<TResult1>)): Promise<TResult1> {
        return await func(this._value);
    }

    //Write
    write(value: string): void {
        if (this._value !== value) {
            value = (this._limit ? this._limit.limit(value) : value);
            if (this._value !== value)
                this.set(value);
        }
    }
    check(value: string): string | undefined {
        return (this._limit ? this._limit.check(value) : undefined)
    }

    limit(value: string): string {
        return (this._limit ? this._limit.limit(value) : value);
    }

    //Owner
    set(value: string) {
        this._value = value;
        this._updateSubscribers(value);
    }
}