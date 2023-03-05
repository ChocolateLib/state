
export type StateDefaultOptions = {
    readonly name: string,
    readonly description?: string
    readonly icon?: () => SVGSVGElement
    readonly writeable: boolean,
};

export type StateSubscriber<T> = (val: T) => void

export type StateOptionsSubscriber<T, O = StateDefaultOptions> = (state: T, options?: O) => void

export interface StateRead<T, O = StateDefaultOptions> {
    /**This adds a function as a subscriber to the state
     * @param update set true to update subscriber*/
    subscribe(func: StateSubscriber<T>, update?: boolean): StateSubscriber<any>
    /**This removes a function as a subscriber to the state*/
    unsubscribe(func: StateSubscriber<T>): StateSubscriber<any>
    /** This sets the value of the state and updates all subscribers*/
    get(): T
    /**Makes the state awaitable */
    then<TResult1 = T, TResult2 = never>(onfulfilled: ((value: T) => TResult1 | PromiseLike<TResult1>), onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>)): PromiseLike<TResult1 | TResult2>
    /**This adds a function as a subscriber to the states options
     * @param update set true to update subscriber*/
    subscribeOptions(func: StateOptionsSubscriber<this, O>, update?: boolean): StateOptionsSubscriber<any, O>
    /**This removes a function as a subscriber to the state*/
    unsubscribeOptions(func: StateOptionsSubscriber<this, O>): StateOptionsSubscriber<any, O>
}
export interface StateWrite<T, O = StateDefaultOptions> extends StateRead<T, O> {
    /** This sets the value of the state and updates all subscribers*/
    set(val: T): void
}

export class StateClass<T, O = StateDefaultOptions> implements StateWrite<T, O>{
    protected _value: T;
    protected _subscribers: StateSubscriber<T>[] = [];

    readonly options: O | undefined;
    protected _optionSubscribers: StateOptionsSubscriber<this, O>[] | undefined;

    constructor(init: T) {
        this._value = init;
    }

    subscribe(func: StateSubscriber<T>, update?: boolean) {
        this._subscribers.push(func);
        if (update) {
            func(this._value)
        }
        return func;
    }

    unsubscribe(func: StateSubscriber<T>) {
        const index = this._subscribers.indexOf(func);
        if (index != -1) {
            this._subscribers.splice(index, 1);
        } else {
            console.warn('Subscriber not found with state');
        }
        return func;
    }

    set(val: T): void {
        if (this._value !== val) {
            this._value = val;
            this._update(val);
        }
    }

    get() {
        return this._value
    }

    then<TResult1 = T, TResult2 = never>(onfulfilled: ((value: T) => TResult1 | PromiseLike<TResult1>)): PromiseLike<TResult1 | TResult2> {
        return new Promise((a) => { a(onfulfilled(this._value)) });
    }

    private _update(val: T): void {
        for (let i = 0, m = this._subscribers.length; i < m; i++) {
            try {
                this._subscribers[i](val);
            } catch (e) {
                console.warn('Failed while calling subscribers ', e);
            }
        }
    }

    subscribeOptions(func: StateOptionsSubscriber<this, O>, update?: boolean) {
        if (!this._optionSubscribers) {
            this._optionSubscribers = [];
        }
        this._optionSubscribers.push(func);
        if (update) {
            func(this, this.options);
        }
        return func;
    }
    unsubscribeOptions(func: StateOptionsSubscriber<this, O>) {
        if (this._optionSubscribers) {
            const index = this._optionSubscribers.indexOf(func);
            if (index != -1) {
                this._optionSubscribers.splice(index, 1);
            } else {
                console.warn('Option subscriber not found with state');
            }
        }
        return func;
    }
}

export const stateUpdaterSubscribers = <T>(state: StateClass<T>, val: T): void => {
    //@ts-expect-error
    for (let i = 0, m = state._subscribers.length; i < m; i++) {
        try {
            //@ts-expect-error
            state._subscribers[i](val);
        } catch (e) {
            console.warn('Failed while calling subscribers ', e);
        }
    }
}

/**Function used to change value of state */
export type StateWriter<T> = (value: T) => void

/**Function used to change value of state */
export type StateWritableCheck<T> = (value: T) => void

/**Creates a state
 * @param init initial value for state, use undefined to indicate that state does not have a value yet*/
export const createState = <T, O = StateDefaultOptions>(init: T, check?: any, option?: O) => {
    let state = new StateClass<T>(init);
    return {
        state: state as StateWrite<T, O>,
        set: ((val: T) => { stateUpdaterSubscribers(state, val) }) as StateWriter<T>,
    }
}