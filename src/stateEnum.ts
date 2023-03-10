import { State, StateUserSet, StateSubscriber, StateOptions, StateSubscribe, StateSetter, StateNumberOptions, StateStringOptions, StateEnumOptions } from "./shared";
import { StateBase } from "./stateBase";
import { createStateOptions, StateOptionsClass } from "./stateOptions";

export class StateClass<T, O extends StateOptions = StateOptions> extends StateBase<T> implements State<T, O> {
    constructor(init: T) {
        super();
        this._value = init;
    }

    _value: T;
    _setter: StateUserSet<T> | undefined;
    _options: StateSubscribe<O> | undefined

    setAndUpdate(value: T) {
        this._value = value;
        this._updateSubscribers(value);
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
            this._setter(value, this.setAndUpdate.bind(this));
        }
    }

    async then<TResult1 = T>(func: ((value: T) => TResult1 | PromiseLike<TResult1>)): Promise<TResult1> {
        return await func(this._value);
    }

    options(): StateSubscribe<O> | undefined {
        return this._options;
    }
}

/**Creates a state which holds a value
 * @param init initial value for state, use undefined to indicate that state does not have a value yet
 * @param setter function called when state value is set via setter, set true let state set it's own value */
export const createState = <T = undefined, O extends StateOptions = StateOptions>(init: T, setter?: StateUserSet<T> | boolean, options?: StateSubscribe<O> | O) => {
    let state = new StateClass<T>(init);
    if (setter) {
        state._setter = (setter === true ? state.setAndUpdate : setter);
    }
    if (options) {
        if (options instanceof StateOptionsClass) {
            state._options = options;
        } else {
            state._options = createStateOptions(<O>options).options;
        }
    }
    return {
        state: state as State<T, O>,
        set: state.setAndUpdate.bind(state) as StateSetter<T>
    }
}

/**Creates a state which holds a boolean value*/
export const createStateBoolean = (createState as typeof createState<boolean, StateOptions>)

/**Creates a state which holds a number value*/
export const createStateNumber = (createState as typeof createState<number, StateNumberOptions>)

/**Creates a state which holds a string value*/
export const createStateString = (createState as typeof createState<string, StateStringOptions>)