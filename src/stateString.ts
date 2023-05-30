import { StateStringLimits } from "./helpers";
import { StateBase } from "./stateBase";
import { StateInfo, StateWrite } from "./types";

/**Function called when user sets value*/
export type StateStringSetter = (value: string, set: StateString) => void

export class StateString extends StateBase<string> implements StateWrite<string>, StateInfo<string> {
    /**Creates a state which holds a string
     * @param init initial value for state, use undefined to indicate that state does not have a value yet
     * @param limiter limiter struct to limit string*/
    constructor(init: string, setter?: StateStringSetter | boolean, limiter?: StateStringLimits) {
        super();
        if (setter)
            this._setter = (setter === true ? this.set : setter);
        if (limiter)
            this._limit = limiter;
        this._value = init;
    }

    private _value: string;
    private _setter: StateStringSetter | undefined;
    private _limit: StateStringLimits | undefined;

    //Read
    async then<TResult1 = string>(func: ((value: string) => TResult1 | PromiseLike<TResult1>)): Promise<TResult1> {
        return await func(this._value);
    }

    //Write
    write(value: string): void {
        if (this._setter)
            if (this._value !== value) {
                value = (this._limit ? this._limit.limit(value) : value);
                if (this._value !== value)
                    this._setter(value, this);
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