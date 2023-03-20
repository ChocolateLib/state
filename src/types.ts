/**Function used to subscribe to state changes */
export type StateSubscriber<R> = (val: R) => void

/**Function called when user sets value*/
export type StateUserSet<R, W extends R = R> = (value: W, set: StateOwner<R>) => void


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

export interface StateWrite<R, W extends R = R> extends StateRead<R> {
    /** This sets the value of the state and updates all subscribers */
    write(value: W): void
    /**Used to check if a value is valid for the state, returns the reason why it is not valid */
    check(value: W): string | undefined
    /**Returns the given value modified to be within the states limits, or just the given value */
    limit(value: W): W
}

export interface StateOwner<R, W extends R = R> extends StateWrite<R, W> {
    /**Sets value of state and updates subscribers */
    set(value: R): void
    /**Returns wether the state has subscribers, true means it has*/
    inUse(): boolean
    /**Returns wether the state has a specific subscriber*/
    hasSubscriber(subscriber: StateSubscriber<R>): boolean
}

export interface StateAsync<R, W extends R = R> extends StateOwner<R, W> {
    /**Called to fulfill any waiting promises for value */
    setFulfillment(value: R): void
    /**Called to reject any waiting promises for value, in case value is not retrievable */
    setRejection(value: any): void
    /**Called to update value and subscribers
     * in normal cases valid should be set true
     * when connection is lost to source, value is set to undefined, and valid is set to false*/
    setLiveValue(value: R, invalidReason?: any): void
}

/**Function used to retrieve value from async source once*/
export type StateAsyncRead<R> = (state: StateAsync<R>) => void
/**Function used when user writes to async source*/
export type StateAsyncWrite<R, W extends R = R> = (value: W, state: StateAsync<R>) => void


export type StateEnumEntry = {
    name: string,
    description?: string,
    icon?: () => SVGSVGElement,
}

export type StateEnumList = {
    [key: string | number]: StateEnumEntry
}

export interface StateNumberStepLimits {
    /**Size of steps, eg 2 means 2,4,6,8 are allowed*/
    size: number,
    /**Step start, eg with size 1 and start 0.2, 0.2,1.2,2.2 are allowed */
    start?: number,
}

export interface StateNumberLimits {
    min?: number;
    max?: number;
    step?: StateNumberStepLimits;
}

export interface StateStringLimits {
    maxLength?: number,
    maxByteLength?: number,
}