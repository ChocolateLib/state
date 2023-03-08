import { StateOptions, StateReadSubscribe, StateSetter, StateSubscriber } from "./shared";
import { StateBase } from "./stateBase";

export class StateOptionsClass<T extends StateOptions = StateOptions> extends StateBase<T> implements StateReadSubscribe<T> {
    constructor(init: T) {
        super();
        this.options = { ...init };
    }

    _subscribers: StateSubscriber<T>[] = [];
    options: T;
    externalSetter: StateSetter<T> | undefined;

    setAndUpdate(value: T) {
        this.options = { ...this.options, ...value };
        this.updateSubscribers(value);
    }

    subscribe<B extends StateSubscriber<T>>(func: B, update?: boolean): B {
        if (update) {
            try {
                func(this.options);
            } catch (error) {
                console.warn('Failed while calling update function', this, func);
            }
        }
        return super.subscribe(func);
    }

    set(value: T): void {
        if (this.externalSetter && this.options !== value) {
            this.externalSetter(value)
        }
    }

    get(): T {
        return this.options
    }

    async then<TResult1 = T>(func: ((value: T) => TResult1 | PromiseLike<TResult1>)): Promise<TResult1> {
        return await func(this.options);
    }
}

/**Creates a state which holds a value
 * @param init initial value for state, use undefined to indicate that state does not have a value yet
 * @param setter function called when state value is set via setter, set true to just have */
export const createStateOptions = <T extends StateOptions = StateOptions>(init: T, setter?: StateSetter<T> | boolean) => {
    let options = new StateOptionsClass<T>(init as T);
    if (setter) {
        options.externalSetter = (setter === true ? options.setAndUpdate : setter);
    }
    return {
        options: options as StateReadSubscribe<T>,
        set: options.setAndUpdate.bind(options) as (options: T) => void,
    }
}