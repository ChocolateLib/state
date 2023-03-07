import { State, StateBase, StateDefaultOptions, StateSetter, StateSubscriber } from "./shared";

export interface StateValueOptions extends StateDefaultOptions {
    writeable?: boolean
};

class StateValue<T> extends StateBase<T, StateValueOptions> {
    constructor(init: T) {
        super();
        this.value = init;
    }

    //Internal
    value: T;
    externalSetter: StateSetter<T> | undefined;

    setAndUpdate(value: T) {
        this.value = value;
        this.updateSubscribers(value);
    }

    setOptionAndUpdate(options: StateValueOptions) {
        this.options = options;
        this.updateOptionsSubscribers(options);
    }

    //Subscribe
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
        if (this.options?.writeable && this.externalSetter && this.value !== value) {
            this.externalSetter(value)
        }
    }

    //Getting
    writeable(): boolean {
        return !!this.options?.writeable;
    }

    get(): T {
        return this.value
    }

    async then<TResult1 = T>(func: ((value: T) => TResult1 | PromiseLike<TResult1>)): Promise<TResult1> {
        return await func(this.value);
    }
}

/**Creates a state which holds a value
 * @param init initial value for state, use undefined to indicate that state does not have a value yet
 * @param setter function called when state value is set via setter, set true to just have */
export const createState = <T>(init: T, setter?: StateSetter<T> | boolean, options?: StateValueOptions) => {
    let state = new StateValue<T>(init);
    if (setter) {
        state.externalSetter = (setter ? state.setAndUpdate : setter);
    }
    if (options) {
        state.options = options;
    }
    return {
        state: state as State<T, StateValueOptions>,
        set: state.setAndUpdate.bind(state) as (value: T) => void,
        setOptions: state.setOptionAndUpdate.bind(state) as (options: StateValueOptions) => void,
    }
}