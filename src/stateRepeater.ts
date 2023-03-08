import { State, StateReadSubscribe, StateSubscriber, StateOptions } from "./shared";
import { StateBase } from "./stateBase";

class StateRepeater<T, I, O extends StateOptions = StateOptions> extends StateBase<T | undefined> implements State<T | undefined, O> {
    constructor(getter: (val: I) => T, state?: State<I, O>, setter?: (val: T) => I) {
        super();
        this._getter = getter;
        this._state = state;
        this._setter = setter;
    }

    _valid: boolean = false;
    _buffer: T | undefined;
    _state: State<I, O> | undefined;
    _getter: (val: I) => T;
    _setter: ((val: T) => I) | undefined;

    _subscriber(value: I) {
        this._buffer = this._getter(value);
        this.updateSubscribers(this._buffer);
    };

    setAndUpdate(state: State<I, O> | undefined) {
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
            this._state.unsubscribe(this._subscriber);
        }
        return this.unsubscribe(func);
    }

    set(value: T): void {
        if (this._setter && this._state) {
            this._state.set(this._setter(value));
        }
    }

    get(): T | PromiseLike<T> | undefined {
        if (this._valid) {
            return <T>this._buffer;
        } else if (this._state) {
            let value = <PromiseLike<I>>this._state.get();
            if (typeof value.then === 'function') {
                return value.then(this._getter);
            } else {
                return this._getter(<I>value);
            }
        } else {
            return undefined;
        }
    }

    async then<TResult1 = T>(func: ((value: T | undefined) => TResult1 | PromiseLike<TResult1>)): Promise<TResult1> {
        if (this._valid) {
            return func(<T>this._buffer)
        } else if (this._state) {
            return func(this._getter(await this._state));
        } else {
            return func(undefined);
        }
    }

    async options(): Promise<StateReadSubscribe<O> | undefined> {
        if (this._state) {
            return await this._state.options();
        } else {
            return undefined;
        }
    }
}

/**Creates a state which holds a value
 * @param init initial value for state, use undefined to indicate that state does not have a value yet
 * @param setter function called when state value is set via setter, set true let state set it's own value */
export const createStateRepeater = <T, I, O extends StateOptions = StateOptions>(getter: (val: I) => T, state?: State<I, O>, setter?: (val: T) => I) => {
    let repeater = new StateRepeater<T, I, O>(getter, state, setter);
    return {
        repeater: repeater as State<T>,
        setState: repeater.setAndUpdate.bind(repeater) as (value: State<I> | undefined) => void,
    }
}