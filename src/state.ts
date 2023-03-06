
export interface StateDefaultOptions {
    name?: string,
    description?: string
    icon?: () => SVGSVGElement
    writeable?: boolean,
};

export type StateSubscriber<T> = (val: T) => void

export type StateOptionsSubscriber<O extends StateDefaultOptions = StateDefaultOptions> = (options?: O) => void

export interface StateSubscribe<T> {
    /**This adds a function as a subscriber to the state
     * @param update set true to update subscriber*/
    subscribe(func: StateSubscriber<T>, update?: boolean): StateSubscriber<any>
    /**This removes a function as a subscriber to the state*/
    unsubscribe(func: StateSubscriber<T>): StateSubscriber<any>
}
export interface StateRead<T> {
    /** This sets the value of the state and updates all subscribers*/
    get(): T
    /**Makes the state awaitable */
    then<TResult1 = T, TResult2 = never>(onfulfilled: ((value: T) => TResult1 | PromiseLike<TResult1>), onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>)): PromiseLike<TResult1 | TResult2>
}
export interface StateWrite<T> {
    /** This sets the value of the state and updates all subscribers*/
    set(val: T): void
}
export interface StateOptions<O extends StateDefaultOptions = StateDefaultOptions> {
    /**States options */
    readonly options: O | undefined
    /**This adds a function as a subscriber to the states options
     * @param update set true to update subscriber*/
    subscribeOptions(func: StateOptionsSubscriber<O>, update?: boolean): typeof func
    /**This removes a function as a subscriber to the state*/
    unsubscribeOptions(func: StateOptionsSubscriber<O>): typeof func
}

export interface State<T, O extends StateDefaultOptions = StateDefaultOptions> extends StateSubscribe<T>, StateRead<T>, StateWrite<T>, StateOptions<O> { }

export class StateClass<T, O extends StateDefaultOptions = StateDefaultOptions> implements State<T, O>{
    protected _value: T;
    protected _subscribers: StateSubscriber<T>[] = [];
    protected _check: StateCheck<T> | undefined;

    readonly options: O | undefined;
    protected _optionSubscribers: StateOptionsSubscriber<O>[] | undefined;

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

    set(value: T): void {
        if (this._check && this._value !== value) {
            this._check(value)
        }
    }

    get() {
        return this._value
    }

    then<TResult1 = T, TResult2 = never>(onfulfilled: ((value: T) => TResult1 | PromiseLike<TResult1>)): PromiseLike<TResult1 | TResult2> {
        return new Promise((a) => { a(onfulfilled(this._value)) });
    }

    subscribeOptions(func: StateOptionsSubscriber<Readonly<O>>, update?: boolean) {
        if (!this._optionSubscribers) {
            this._optionSubscribers = [];
        }
        this._optionSubscribers.push(func);
        if (update) {
            func(this.options);
        }
        return func;
    }
    unsubscribeOptions(func: StateOptionsSubscriber<Readonly<O>>) {
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

export const stateUpdaterSubscribers = <T>(state: StateClass<any, any>, val: T): void => {
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
export const stateUpdaterOptionsSubscribers = <O>(state: StateClass<any, any>, options: O): void => {
    //@ts-expect-error
    for (let i = 0, m = state._optionSubscribers.length; i < m; i++) {
        try {
            //@ts-expect-error
            state._optionSubscribers[i](options);
        } catch (e) {
            console.warn('Failed while calling subscribers ', e);
        }
    }
}

/**Function used to change value of state */
export type StateSetter<T> = (value: T) => void

/**Function used to change value of state */
export type StateOptionSetter<O = StateDefaultOptions> = (options: O) => void

/**Function used to change value of state */
export type StateCheck<T> = (value: T) => void

/**Creates a state
 * @param init initial value for state, use undefined to indicate that state does not have a value yet*/
export const createState = <T, O extends StateDefaultOptions>(init: T, check?: StateCheck<T>, options?: O) => {
    let state = new StateClass<T, O>(init);
    if (check) {
        //@ts-expect-error
        state._check = check;
    }
    if (options) {
        //@ts-expect-error
        state.options = options;
    }
    return {
        state: state as State<T, Readonly<Partial<O>>>,
        set: ((val: T) => { stateUpdaterSubscribers(state, val); }) as StateSetter<T>,
        setOptions: ((options: O) => { stateUpdaterOptionsSubscribers(state, options); }) as StateOptionSetter<O>,
    }
}