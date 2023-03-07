export interface StateDefaultOptions {
    name?: string,
    description?: string,
    icon?: () => SVGSVGElement,
};

export type StateSubscriber<T> = (val: T) => void

export type StateOptionsSubscriber<O extends StateDefaultOptions = StateDefaultOptions> = (options?: O) => void

export interface StateRead<T> {
    /**Returns if the state is writable*/
    writeable(): boolean
    /** This sets the value of the state and updates all subscribers*/
    get(): T | PromiseLike<T>
    /**Makes the state awaitable */
    then<TResult1 = T, TResult2 = never>(onfulfilled: ((value: T) => TResult1 | PromiseLike<TResult1>), onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>)): PromiseLike<TResult1 | TResult2>
}

export interface StateWrite<T> {
    /** This sets the value of the state and updates all subscribers*/
    set(val: T): void
}

export interface StateSubscribe<T> {
    /**This adds a function as a subscriber to the state
     * @param update set true to update subscriber*/
    subscribe<B extends StateSubscriber<T>>(func: B, update?: boolean): B
    /**This removes a function as a subscriber to the state*/
    unsubscribe<B extends StateSubscriber<T>>(func: B): B
}

export interface StateOptions<O extends StateDefaultOptions = StateDefaultOptions> {
    /**States options */
    readonly options: Readonly<O> | undefined
    /**This adds a function as a subscriber to the states options
     * @param update set true to update subscriber*/
    subscribeOptions(func: StateOptionsSubscriber<O>, update?: boolean): typeof func
    /**This removes a function as a subscriber to the state*/
    unsubscribeOptions(func: StateOptionsSubscriber<O>): typeof func
}

export interface State<T, O extends StateDefaultOptions> extends StateSubscribe<T>, StateRead<T>, StateWrite<T>, StateOptions<O> { }

export abstract class StateBase<T, O extends StateDefaultOptions = StateDefaultOptions> implements State<T, O>{
    subscribers: StateSubscriber<T>[] = [];
    optionSubscribers: StateOptionsSubscriber<O>[] | undefined;

    //Subscribe
    subscribe<B extends StateSubscriber<T>>(func: B): B {
        this.subscribers.push(func);
        return func;
    }

    unsubscribe<B extends StateSubscriber<T>>(func: B): B {
        const index = this.subscribers.indexOf(func);
        if (index != -1) {
            this.subscribers.splice(index, 1);
        } else {
            console.warn('Subscriber not found with state', this, func);
        }
        return func;
    }

    //Setting
    abstract set(value: T): void

    updateSubscribers(value: T): void {
        for (let i = 0, m = this.subscribers.length; i < m; i++) {
            try {
                this.subscribers[i](value);
            } catch (e) {
                console.warn('Failed while calling subscribers ', e, this, this.subscribers[i]);
            }
        }
    }

    //Getting
    abstract writeable(): boolean

    abstract get(): T | PromiseLike<T>

    abstract then<TResult1 = T, TResult2 = never>(onfulfilled: ((value: T) => TResult1 | PromiseLike<TResult1>)): PromiseLike<TResult1 | TResult2>

    //Options
    options: O | undefined

    subscribeOptions(func: StateOptionsSubscriber<Readonly<O>>, update?: boolean) {
        if (!this.optionSubscribers) {
            this.optionSubscribers = [];
        }
        this.optionSubscribers.push(func);
        if (update) {
            func(this.options);
        }
        return func;
    }
    unsubscribeOptions(func: StateOptionsSubscriber<Readonly<O>>) {
        if (this.optionSubscribers) {
            const index = this.optionSubscribers.indexOf(func);
            if (index != -1) {
                this.optionSubscribers.splice(index, 1);
            } else {
                console.warn('Option subscriber not found with state', this, func);
            }
        }
        return func;
    }
    updateOptionsSubscribers(options: O): void {
        if (this.optionSubscribers) {
            for (let i = 0, m = this.optionSubscribers.length; i < m; i++) {
                try {
                    this.optionSubscribers[i](options);
                } catch (e) {
                    console.warn('Failed while calling subscribers ', e, this, this.optionSubscribers[i]);
                }
            }
        }
    }
}

/**Function used to check set value for state */
export type StateSetter<T> = (value: T) => void

/**Checks if a variable is an instance of a state*/
export const instanceOfState = (state: any) => {
    return state instanceof StateBase;
}