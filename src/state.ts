import { StateBase } from "./stateBase";
import { StateChecker, StateLimiter, StateInfo, StateWrite } from "./types";

export interface StateOwner<R, W extends R = R> extends StateWrite<R, W>, StateInfo<R> {
    /**Sets value of state and updates subscribers */
    set(value: R): void
}

/**Function called when user sets value*/
type Getter<R, W extends R = R> = (value: W, set: StateOwner<R>) => void

export class StateClass<R, W extends R> extends StateBase<R> implements StateOwner<R, W> {
    constructor(init: R) {
        super();
        this._value = init;
    }

    _value: R;
    _setter: Getter<R, W> | undefined;
    _check: StateChecker<W> | undefined;
    _limit: StateLimiter<W> | undefined;

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

/**Creates a state which holds a value
 * @param init initial value for state, use undefined to indicate that state does not have a value yet
 * @param setter function called when state value is set via setter, set true let state set it's own value 
 * @param checker function to allow state users to check if a given value is valid for the state
 * @param limiter function to allow state users to limit a given value to state limit */
export const createState = <R, W extends R = R>(init: R, setter?: Getter<R, W> | boolean, checker?: StateChecker<W>, limiter?: StateLimiter<W>) => {
    let state = new StateClass<R, W>(init);
    if (setter)
        state._setter = (setter === true ? state.set : setter);
    if (checker)
        state._check = checker;
    if (limiter)
        state._limit = limiter;
    return state as StateOwner<R, W>
}