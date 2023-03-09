import { StateSubscribe, StateSubscriber, StateWrite } from "./shared";
import { StateBase } from "./stateBase";

type Getter<T, I> = (value: I) => T
type Setter<T, I> = (value: T) => I

class StateRepeaterClass<T, I> extends StateBase<T | undefined> implements StateWrite<T | undefined> {
    constructor(state?: StateWrite<I>, getter?: Getter<T, I>, setter?: Setter<T, I>) {
        super();
        this._getter = getter;
        this._state = state;
        this._setter = setter;
    }

    _valid: boolean = false;
    _buffer: T | undefined;
    _state: StateWrite<I> | undefined;
    _getter: Getter<T, I> | undefined;
    _setter: Setter<T, I> | undefined;

    _subscriber(value: I) {
        this._valid = true;
        this._buffer = (this._getter ? this._getter(value) : <any>value);
        this._updateSubscribers(this._buffer);
    };

    _setState(state: StateWrite<I> | undefined) {
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
                this._subscriber = state.subscribe(this._subscriber.bind(this), true);
            }
            this._state = state;
        }
    }

    subscribe<B extends StateSubscriber<T | undefined>>(func: B, update?: boolean): B {
        if (this._subscribers.length === 0 && this._state) {
            this._state.subscribe(this._subscriber.bind(this), update);
        }
        if (update) {
            try {
                this.then(func);
            } catch (error) {
                console.warn('Failed while calling update function', this, func);
            }
        }
        return super.subscribe(func);
    }

    unsubscribe<B extends StateSubscriber<T | undefined>>(func: B): B {
        if (this._subscribers.length === 1 && this._state) {
            this._valid = false
            this._state.unsubscribe(this._subscriber);
        }
        return this.unsubscribe(func);
    }

    set(value: T): void {
        if (this._setter && this._state) {
            this._state.set(this._setter(value));
        }
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
export const createStateRepeater = <T, I>(state?: StateSubscribe<I>, getter?: Getter<T, I>) => {
    let repeater = new StateRepeaterClass<T, I>(<any>state, getter);
    return {
        repeater: repeater as StateSubscribe<T>,
        setState: repeater._setState.bind(repeater) as (value: StateSubscribe<I> | undefined) => void,
    }
}

/**Creates a state which repeats the value of another state
 * @param state the state to repeat
 * @param getter function used to modify value repeated from state
 * @param setter function used to modify value repeated to state */
export const createStateRepeaterWrite = <T, I>(state?: StateWrite<I>, getter?: Getter<T, I>, setter?: Setter<T, I>) => {
    let repeater = new StateRepeaterClass<T, I>(state, getter, setter);
    return {
        repeater: repeater as StateWrite<T>,
        setState: repeater._setState.bind(repeater) as (value: StateWrite<I> | undefined) => void,
    }
}