import { StateBase } from "./stateBase";
import { StateWrite, StateChecker, StateLimiter, StateSetter, StateUserSet } from "./types";

export class StateClass<R, W extends R> extends StateBase<R> implements StateWrite<R, W> {
    constructor(init: R) {
        super();
        this._value = init;
    }

    _value: R;
    _setter: StateUserSet<R, W> | undefined;
    _check: StateChecker<W> | undefined;
    _limit: StateLimiter<W> | undefined;

    setAndUpdate(value: R) {
        this._value = value;
        this._updateSubscribers(value);
    }

    async then<TResult1 = R>(func: ((value: R) => TResult1 | PromiseLike<TResult1>)): Promise<TResult1> {
        return await func(this._value);
    }

    set(value: W): void {
        if (this._setter && this._value !== value) {
            this._setter(value, this.setAndUpdate.bind(this));
        }
    }

    check(value: W): string | undefined {
        return (this._check ? this._check(value) : undefined)
    }

    limit(value: W): W {
        return (this._limit ? this._limit(value) : value);
    }
}

/**Creates a state which holds a value
 * @param init initial value for state, use undefined to indicate that state does not have a value yet
 * @param setter function called when state value is set via setter, set true let state set it's own value 
 * @param checker function to allow state users to check if a given value is valid for the state
 * @param limiter function to allow state users to limit a given value to state limit */
export const createState = <R, W extends R = R>(init: R, setter?: StateUserSet<R, W> | boolean, checker?: StateChecker<W>, limiter?: StateLimiter<W>) => {
    let state = new StateClass<R, W>(init);
    if (setter) {
        state._setter = (setter === true ? state.setAndUpdate : setter);
    }
    if (checker) {
        state._check = checker;
    }
    if (limiter) {
        state._limit = limiter;
    }
    return {
        state: state as StateWrite<R, W>,
        set: state.setAndUpdate.bind(state) as StateSetter<R>
    }
}