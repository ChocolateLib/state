import { StateOptions, StateUserSet, StateSubscribe, StateSubscriber } from "./shared";
import { StateBase } from "./stateBase";

export class StateOptionsClass<T> extends StateBase<T> {
    constructor(init: T | (() => PromiseLike<T>)) {
        super();
        if (typeof init !== 'function') {
            this.options = { ...init };
        }
    }
    options: T | undefined;
    externalSetter: StateUserSet<T> | undefined;

    setAndUpdate(value: T) {
        this.options = { ...this.options, ...value };
        this._updateSubscribers(value);
    }

    subscribe<B extends StateSubscriber<T>>(func: B, update?: boolean): B {
        if (update) {
            try {
                this.then(func);
            } catch (error) {
                console.warn('Failed while calling update function', this, func);
            }
        }
        return super.subscribe(func);
    }

    async then<TResult1 = T>(func: ((value: T) => TResult1 | PromiseLike<TResult1>)): Promise<TResult1> {
        return func(<T>this.options);
    }
}

/**Creates a state which holds options for another state*/
export const createStateOptions = <T extends StateOptions = StateOptions>(init: T) => {
    let options = new StateOptionsClass<T>(init);
    return {
        options: options as StateSubscribe<T>,
        set: options.setAndUpdate.bind(options) as (options: T) => void,
    }
}