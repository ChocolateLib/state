import { State, StateReadSubscribe, StateSetter, StateSubscriber, StateOptions } from "./shared";
import { StateBase } from "./stateBase";
import { createStateOptions, StateOptionsClass } from "./stateOptions";

class StateValue<T> extends StateBase<T> implements State<T> {
    constructor(init: T) {
        super();
        this._value = init;
    }

    _value: T;
    _setter: StateSetter<T> | undefined;
    _options: StateReadSubscribe<StateOptions> | undefined
    _optionsFunc: (() => Promise<StateReadSubscribe<StateOptions>>) | undefined

    setAndUpdate(value: T) {
        this._value = value;
        this.updateSubscribers(value);
    }

    subscribe<B extends StateSubscriber<T>>(func: B, update?: boolean): B {
        if (update) {
            try {
                func(this._value);
            } catch (error) {
                console.warn('Failed while calling update function', this, func);
            }
        }
        return super.subscribe(func);
    }

    set(value: T): void {
        if (this._setter && this._value !== value) {
            this._setter(value)
        }
    }

    get(): T {
        return this._value
    }

    async then<TResult1 = T>(func: ((value: T) => TResult1 | PromiseLike<TResult1>)): Promise<TResult1> {
        return await func(this._value);
    }

    async options(): Promise<StateReadSubscribe<StateOptions> | undefined> {
        if (!this._options) {
            if (this._optionsFunc) {
                let test = this._optionsFunc();
                delete this._optionsFunc;
            }
        }
        return this._options;
    }
}

/**Creates a state which holds a value
 * @param init initial value for state, use undefined to indicate that state does not have a value yet
 * @param setter function called when state value is set via setter, set true let state set it's own value */
export const createState = <T = undefined>(init?: T, setter?: StateSetter<T> | boolean, options?: () => Promise<StateReadSubscribe<StateOptions>>) => {
    let state = new StateValue<T>(init as T);
    if (setter) {
        state._setter = (setter === true ? state.setAndUpdate : setter);
    }
    if (options) {
        state._optionsFunc = options;
    }
    return {
        state: state as State<T>,
        set: state.setAndUpdate.bind(state) as (value: T) => void
    }
}