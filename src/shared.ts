export interface StateOptions {
    name?: string,
    description?: string,
    icon?: () => SVGSVGElement,
    writable?: boolean,
};

export type StateSubscriber<T> = (val: T) => void

export interface StateRead<T> {
    /** This sets the value of the state and updates all subscribers*/
    get(): T | PromiseLike<T>
    /**Makes the state awaitable */
    then<TResult1 = T, TResult2 = never>(onfulfilled: ((value: T) => TResult1 | PromiseLike<TResult1>), onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>)): PromiseLike<TResult1 | TResult2>
}

export interface StateSubscribe<T> {
    /**This adds a function as a subscriber to the state
     * @param update set true to update subscriber*/
    subscribe<B extends StateSubscriber<T>>(func: B, update?: boolean): B
    /**This removes a function as a subscriber to the state*/
    unsubscribe<B extends StateSubscriber<T>>(func: B): B
}

export interface StateReadSubscribe<T> extends StateRead<T>, StateSubscribe<T> { }

export interface StateWrite<T> {
    /** This sets the value of the state and updates all subscribers*/
    set(val: T): void
}

export interface State<T, O extends StateOptions = StateOptions> extends StateSubscribe<T>, StateRead<T>, StateWrite<T> {
    options(): Promise<StateReadSubscribe<O> | undefined>
}


/**Function used to check set value for state */
export type StateSetter<T> = (value: T) => void

