/**Function used to subscribe to state changes */
export type StateSubscriber<R> = (val: R) => void

/**Function used to check if a value is within state limits*/
export type StateChecker<W> = (value: W) => string | undefined

/**Function used to limit value to withint state limits*/
export type StateLimiter<W> = (value: W) => W

export interface StateRead<R> {
    /**Allows getting */
    then<TResult1 = R, TResult2 = never>(onfulfilled: ((value: R) => TResult1 | PromiseLike<TResult1>), onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>)): PromiseLike<TResult1 | TResult2>
    /**This adds a function as a subscriber to the state
     * @param update set true to update subscriber*/
    subscribe<B extends StateSubscriber<R>>(func: B, update?: boolean): B
    /**This removes a function as a subscriber to the state*/
    unsubscribe<B extends StateSubscriber<R>>(func: B): B
}

export interface StateInfo<R> extends StateRead<R> {
    /**Returns wether the state has subscribers, true means it has*/
    inUse(): boolean
    /**Returns wether the state has a specific subscriber*/
    hasSubscriber(subscriber: StateSubscriber<R>): boolean
}

export interface StateWrite<R, W extends R = R> extends StateRead<R> {
    /** This sets the value of the state and updates all subscribers */
    write(value: W): void
    /**Used to check if a value is valid for the state, returns the reason why it is not valid */
    check(value: W): string | undefined
    /**Returns the given value modified to be within the states limits, or just the given value */
    limit(value: W): W
}