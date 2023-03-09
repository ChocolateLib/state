import { StateSubscriber, StateWrite, StateSubscribe } from "./shared";
import { StateBase } from "./stateBase";

type Getter<T, I> = (value: I[]) => T

class StateDerivedClass<T, I> extends StateBase<T | undefined> {
    constructor(getter: Getter<T, I>, states?: StateSubscribe<I>[]) {
        super();
        this._getter = getter;
        this._states = states;
    }

    _valid: boolean = false;
    _buffer: T | undefined;
    _states: StateSubscribe<I>[] | undefined;
    _stateBuffers: I[] = [];
    _stateSubscribers: StateSubscriber<I>[] = [];
    _getter: Getter<T, I>;

    _subscriber(value: I) {
        this._buffer = this._getter(value);
        this.updateSubscribers(this._buffer);
    };

    setStates(state: StateSubscribe<I> | undefined) {
        if (this._states) {
            if (this._subscribers.length > 0) {
                this._states.unsubscribe(this._subscriber);
            }
            if (!state) {
                this._states = undefined;
            }
        }
        if (state) {
            if (this._subscribers.length) {
                this._subscriber = state.subscribe(this._subscriber.bind(this), true);
            }
            this._states = state;
        }
    }

    subscribe<B extends StateSubscriber<T | undefined>>(func: B, update?: boolean): B {
        if (this._subscribers.length === 0 && this._states) {
            this._states.subscribe(this._subscriber.bind(this), update);
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
        if (this._subscribers.length === 1 && this._states) {
            this._states.unsubscribe(this._subscriber);
        }
        return this.unsubscribe(func);
    }

    async get(): Promise<T | undefined> {
        if (this._valid) {
            return <T>this._buffer;
        } else if (this._states) {
            return this._getter(await Promise.all(this._states));
        } else {
            return undefined;
        }
    }

    async then<TResult1 = T>(func: ((value: T | undefined) => TResult1 | PromiseLike<TResult1>)): Promise<TResult1> {
        return func(await this.get());
    }
}

/**Creates a state which holds a value
 * @param init initial value for state, use undefined to indicate that state does not have a value yet
 * @param setter function called when state value is set via setter, set true let state set it's own value */
export const createStateDerived = <T, I>(getter: Getter<T, I>, states?: StateSubscribe<I>[]) => {
    let repeater = new StateDerivedClass<T, I>(getter, states);
    return {
        repeater: repeater as StateSubscribe<T>,
        setStates: repeater.setStates.bind(repeater) as (value: StateSubscribe<I>[] | undefined) => void,
    }
}