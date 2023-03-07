import { State, StateBase, StateDefaultOptions, StateSubscriber } from "./shared";

export interface StateValueOptions extends StateDefaultOptions {
    writeable?: boolean
};

class StateValue<T> extends StateBase<T, StateValueOptions> {
    value: T;
    check: StateCheck<T> | undefined;
    _writeable: boolean | undefined;

    constructor(init: T) {
        super();
        this.value = init;
    }

    subscribe<B extends StateSubscriber<T>>(func: B, update?: boolean): B {
        if (update) {
            try {
                func(this.value);
            } catch (error) {
                console.warn('Failed while calling update function', this, func);
            }
        }
        return super.subscribe(func);
    }

    //Setting
    set(value: T): void {
        if (this.check && this.value !== value) {
            this.check(value)
        }
    }

    //Getting
    writeable(): boolean {
        return !!this._writeable;
    }

    get(): T {
        return this.value
    }

    then<TResult1 = T, TResult2 = never>(onfulfilled: ((value: T) => TResult1 | PromiseLike<TResult1>)): PromiseLike<TResult1 | TResult2> {
        return new Promise((a) => { a(onfulfilled(this.value)) });
    }
}

/**Function used to check set value for state */
export type StateCheck<T> = (value: T) => void

/**Creates a state which holds a value
 * @param init initial value for state, use undefined to indicate that state does not have a value yet
 * @param check function called when state value is set via setter
 * @param initial state options*/
export const createStateValue = <T>(init: T, check?: StateCheck<T>, options?: StateValueOptions) => {
    let state = new StateValue<T>(init);
    if (check) {
        state.check = check;
    }
    if (options) {
        state.options = options;
    }
    return {
        state: state as State<T, StateValueOptions>,
        set: ((val: T) => {
            state.updateSubscribers(val);
        }),
        setOptions: ((options: StateValueOptions) => {
            state.updateOptionsSubscribers(options);
        }),
    }
}