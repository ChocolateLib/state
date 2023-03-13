import { StateBase } from "./stateBase";
import { StateRead, StateSubscriber } from "./types";

type Getter<T, I> = (value: I) => T

class StateRepeaterClass<T, I> extends StateBase<T | undefined> {
    constructor(state?: StateRead<I>) {
        super();
        this._state = state;
    }

    _valid: boolean = false;
    _buffer: T | undefined;
    _state: StateRead<I> | undefined;
    _getter: Getter<T, I> | undefined;

    _subscriber(value: I) {
        this._valid = true;
        this._buffer = (this._getter ? this._getter(value) : <any>value);
        this._updateSubscribers(this._buffer);
    };

    _setState(state: StateRead<I> | undefined) {
        if (this._state) {
            if (this._subscribers.length > 0) {
                this._state.unsubscribe(this._subscriber);
            }
            if (!state) {
                this._state = undefined;
            }
        }
        if (state) {
            if (this._subscribers.length) {
                this._subscriber = state.subscribe(this._subscriber.bind(this));
            }
            this._state = state;
        }
    }

    subscribe<B extends StateSubscriber<T | undefined>>(func: B, update: boolean): B {
        if (this._subscribers.length === 0 && this._state) {
            this._subscribers.push(func);
            this._state.subscribe(this._subscriber.bind(this));
            return func;
        }
        return super.subscribe(func, update);
    }

    unsubscribe<B extends StateSubscriber<T | undefined>>(func: B): B {
        if (this._subscribers.length === 1 && this._state) {
            this._valid = false
            this._state.unsubscribe(this._subscriber);
        }
        return super.unsubscribe(func);
    }

    async then<TResult1 = T>(func: ((value: T | undefined) => TResult1 | PromiseLike<TResult1>)): Promise<TResult1> {
        if (this._valid) {
            return func(<T>this._buffer);
        } else if (this._state) {
            return func((this._getter ? this._getter(await this._state) : <any>await this._state));
        } else {
            return func(undefined);
        }
    }
}

/**Creates a state which repeats the value of another state
 * @param state the state to repeat
 * @param getter function used to modify value repeated from state */
export const createStateRepeater = <T, I>(state?: StateRead<I>, getter?: Getter<T, I>) => {
    let repeater = new StateRepeaterClass<T, I>(state);
    if (getter) {
        repeater._getter = getter;
    }
    return {
        repeater: repeater as StateRead<T>,
        setState: repeater._setState.bind(repeater) as (value: StateRead<I> | undefined) => void,
    }
}