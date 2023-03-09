import { StateSubscriber, StateSubscribe } from "./shared";
import { StateBase } from "./stateBase";

type Getter<T, I> = (value: I[]) => T

class StateDerivedClass<T, I> extends StateBase<T | undefined> {
    constructor(getter: Getter<T, I>, states?: StateSubscribe<I>[]) {
        super();
        this._getter = getter;
        if (states) {
            this._states = [...states];
        }
    }

    _valid: boolean = false;
    _buffer: T | undefined;
    _states: StateSubscribe<I>[] = [];
    _stateBuffers: I[] = [];
    _stateSubscribers: StateSubscriber<I>[] = [];
    _getter: Getter<T, I>;
    _gettingValue: boolean = false;

    _connect() {
        for (let i = 0; i < this._states.length; i++) {
            this._stateSubscribers[i] = this._states[i].subscribe((val) => {
                this._stateBuffers[i] = val;
                if (!this._gettingValue) {
                    this._gettingValue = true;
                    (async () => {
                        await undefined;
                        this._buffer = this._getter(this._stateBuffers);
                        this._updateSubscribers(this._buffer)
                        this._gettingValue = false;
                    })();
                }
            });
        }
    }

    _disconnect() {
        if (this._states) {

        }
        for (let i = 0; i < this._states.length; i++) {
            this._states[i].unsubscribe(this._stateSubscribers[i]);
        }
        this._stateSubscribers = [];
    }

    setStates(states: StateSubscribe<I>[] | undefined) {
        if (this._subscribers.length) {
            this._disconnect();
        }
        if (states) {
            this._states = [...states];
            if (this._subscribers.length) {
                this._connect();
            }
        } else {
            this._states = [];
        }
    }

    subscribe<B extends StateSubscriber<T | undefined>>(func: B, update?: boolean): B {
        if (this._subscribers.length === 0 && this._states) {
            this._connect();
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
        if (this._subscribers.length === 1) {
            this._disconnect();
        }
        return this.unsubscribe(func);
    }

    async then<TResult1 = T>(func: ((value: T | undefined) => TResult1 | PromiseLike<TResult1>)): Promise<TResult1> {
        if (this._valid) {
            return func(<T>this._buffer);
        } else if (this._states) {
            return func(this._getter(await Promise.all(this._states)));
        } else {
            return func(undefined);
        }
    }
}

/**Creates a state which holds a value
 * @param init initial value for state, use undefined to indicate that state does not have a value yet
 * @param getter function called when state value is set via setter, set true let state set it's own value */
export const createStateDerived = <T, I>(getter: Getter<T, I>, states?: StateSubscribe<I>[]) => {
    let repeater = new StateDerivedClass<T, I>(getter, states);
    return {
        repeater: repeater as StateSubscribe<T>,
        setStates: repeater.setStates.bind(repeater) as (value: StateSubscribe<I>[] | undefined) => void,
    }
}