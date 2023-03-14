import { StateSubscriber, StateRead } from "./types";
import { StateBase } from "./stateBase";

type Getter<T, I> = (value: I[]) => T

class StateDerivedClass<O, I> extends StateBase<O | undefined> {
    constructor(getter: Getter<O, I>, states?: StateRead<I>[]) {
        super();
        this._getter = getter;
        if (states) {
            this._states = [...states];
        }
    }

    _valid: boolean = false;
    _buffer: O | undefined;

    _states: StateRead<I>[] = [];
    _stateBuffers: I[] = [];
    _stateSubscribers: StateSubscriber<I>[] = [];

    _getter: Getter<O, I>;
    _calculatingValue: boolean = false;

    async _calculate() {
        await undefined;
        this._buffer = this._getter(this._stateBuffers);
        this._valid = true;
        this._updateSubscribers(this._buffer)
        this._calculatingValue = false;
    }

    _connect() {
        for (let i = 0; i < this._states.length; i++) {
            this._stateSubscribers[i] = this._states[i].subscribe((val) => {
                this._stateBuffers[i] = val;
                if (!this._calculatingValue) {
                    this._calculatingValue = true;
                    this._calculate();
                }
            }, true);
        }
    }

    _disconnect() {
        for (let i = 0; i < this._states.length; i++) {
            this._states[i].unsubscribe(this._stateSubscribers[i]);
        }
        this._stateSubscribers = [];
    }

    setStates(...states: StateRead<I>[]) {
        if (this._subscribers.length) {
            this._disconnect();
            this._states = [...states];
            this._connect();
        } else {
            this._states = [...states];
        }
    }

    subscribe<B extends StateSubscriber<O | undefined>>(func: B, update: boolean): B {
        if (this._subscribers.length === 0) {
            this._subscribers.push(func);
            this._connect();
            return func;
        }
        return super.subscribe(func, update);
    }

    unsubscribe<B extends StateSubscriber<O | undefined>>(func: B): B {
        if (this._subscribers.length === 1) {
            this._disconnect();
        }
        return super.unsubscribe(func);
    }

    async then<TResult1 = O>(func: ((value: O | undefined) => TResult1 | PromiseLike<TResult1>)): Promise<TResult1> {
        if (this._valid) {
            return func(<O>this._buffer);
        } else if (this._states) {
            return func(this._getter(await Promise.all(this._states)));
        } else {
            return func(undefined);
        }
    }
}

/**Creates a state derives a value from other states
 * @param init initial value for state, use undefined to indicate that state does not have a value yet
 * @param getter function called when state value is set via setter, set true let state set it's own value */
export const createStateDerived = <O, I>(getter: Getter<O, I>, ...states: StateRead<I>[]) => {
    let derived = new StateDerivedClass<O, I>(getter, states);
    return {
        derived: derived as StateRead<O>,
        setStates: derived.setStates.bind(derived) as (...states: StateRead<I>[]) => void,
    }
}

const averageFunc = (values: number[]) => {
    let sum = 0;
    for (let i = 0; i < values.length; i++) { sum += values[i]; }
    return sum / values.length;
};
/**Creates a state which keeps the avererage of the value of other states*/
export const createStateAverager = (...states: StateRead<number>[]) => {
    let derived = new StateDerivedClass<number, number>(averageFunc, states);
    return {
        derived: derived as StateRead<number>,
        setStates: derived.setStates.bind(derived) as (...states: StateRead<number>[]) => void,
    }
}
const summerFunc = (values: number[]) => {
    let sum = 0;
    for (let i = 0; i < values.length; i++) { sum += values[i]; }
    return sum;
};
/**Creates a state which keeps the sum of the value of other states*/
export const createStateSummer = (...states: StateRead<number>[]) => {
    let derived = new StateDerivedClass<number, number>(summerFunc, states);
    return {
        derived: derived as StateRead<number>,
        setStates: derived.setStates.bind(derived) as (...states: StateRead<number>[]) => void,
    }
}