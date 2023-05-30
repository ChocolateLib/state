import { StateNumberLimits } from "./helpers";
import { StateBase } from "./stateBase";
import { StateInfo, StateWrite } from "./types";

/**Function called when user sets value*/
export type StateNumberSetter = (value: number, set: StateNumber) => void

export class StateNumber extends StateBase<number> implements StateWrite<number>, StateInfo<number> {
    /**Creates a state which holds a number
     * @param init initial value for state, use undefined to indicate that state does not have a value yet
     * @param limiter limiter struct to limit number*/
    constructor(init: number, setter?: StateNumberSetter | boolean, limiter?: StateNumberLimits) {
        super();
        if (setter)
            this._setter = (setter === true ? this.set : setter);
        if (limiter)
            this._limit = limiter;
        this._value = init;
    }

    private _value: number;
    private _setter: StateNumberSetter | undefined;
    private _limit: StateNumberLimits | undefined;

    //Read
    async then<TResult1 = number>(func: ((value: number) => TResult1 | PromiseLike<TResult1>)): Promise<TResult1> {
        return await func(this._value);
    }

    //Write
    write(value: number): void {
        if (this._setter)
            if (this._value !== value) {
                value = (this._limit ? this._limit.limit(value) : value);
                if (this._value !== value)
                    this._setter(value, this);
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