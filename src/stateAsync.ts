import { StateBase } from "./stateBase";
import { StateWrite, StateChecker, StateLimiter, StateUserSet, StateSubscriber } from "./types";

export class StateAsyncClass<R, W extends R> extends StateBase<R> implements StateWrite<R, W> {
    constructor(init: R) {
        super();
        this._value = init;
    }

    _value: R;
    _valid: boolean = false;

    _setter: StateUserSet<T> | undefined;
    _check: StateChecker<T> | undefined;
    _limit: StateLimiter<T> | undefined;

    setAndUpdate(value: T) {
        this._value = value;
        this._updateSubscribers(value);
    }

    subscribe<B extends StateSubscriber<R>>(func: B, update?: boolean): B {
        if (this._subscribers.length === 0) {
            this._state.subscribe(this._subscriber.bind(this));
        }
        return super.subscribe(func, update);
    }

    unsubscribe<B extends StateSubscriber<R>>(func: B): B {
        if (this._subscribers.length === 1 && this._state) {
            this._valid = false
            this._state.unsubscribe(this._subscriber);
        }
        return this.unsubscribe(func);
    }

    async then<TResult1 = R>(func: ((value: R) => TResult1 | PromiseLike<TResult1>)): Promise<TResult1> {
        return await func(this._value);
    }

    set(value: W): void {
        if (this._setter && this._value !== value) {
            this._setter(value, this.setAndUpdate.bind(this));
        }
    }

    /**Used to check if a value is valid for the state, returns the reason why it is not valid */
    check(value: W): string | undefined {
        return (this._check ? this._check(value) : undefined)
    }

    /**Returns the given value modified to be within the states limits, or just the given value */
    limit(value: W): W {
        return (this._limit ? this._limit(value) : value);
    }
}

/**Creates a state which connects to an async source
 * @param init initial value for state, use undefined to indicate that state does not have a value yet
 * @param once function called when state value is requested once, the function should throw if it fails to get data
 * @param setup function called when state is being used to setup live update of value
 * @param teardown function called when state is no longer being used to teardown/cleanup communication
 * @param setter function called when state value is set via setter, set true let state set it's own value 
 * @param checker function to allow state users to check if a given value is valid for the state
 * @param limiter function to allow state users to limit a given value to state limit */
export const createStateAsync = <R, W extends R>(init: R, setter?: StateUserSet<T> | boolean, checker?: StateChecker<T>, limiter?: StateLimiter<T>) => {
    let state = new StateAsyncClass<R, W>(init);
    if (setter) {
        state._setter = (setter === true ? state.setAndUpdate : setter);
    }
    if (checker) {
        state._check = checker;
    }
    if (limiter) {
        state._limit = limiter;
    }
    return { state: state as StateWrite<R, W> }
}