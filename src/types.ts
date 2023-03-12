export type StateSubscriber<T> = (val: T) => void

/**Function called when user sets value*/
export type StateUserSet<T> = (value: T, set: (value: T) => void) => void

/**Function used to change value of state by owner*/
export type StateSetter<T> = (value: T) => void

/**Function used to check if a value is within state limits*/
export type StateChecker<T> = (value: T) => string | undefined

/**Function used to limit value to withint state limits*/
export type StateLimiter<R> = (value: R) => R

export interface StateRead<R> {
    /**Allows getting */
    then<TResult1 = R, TResult2 = never>(onfulfilled: ((value: R) => TResult1 | PromiseLike<TResult1>), onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>)): PromiseLike<TResult1 | TResult2>
    /**This adds a function as a subscriber to the state
     * @param update set true to update subscriber*/
    subscribe<B extends StateSubscriber<R>>(func: B, update?: boolean): B
    /**This removes a function as a subscriber to the state*/
    unsubscribe<B extends StateSubscriber<R>>(func: B): B
}

export interface StateWrite<R, W extends R> extends StateRead<R> {
    /** This sets the value of the state and updates all subscribers */
    set(value: W): void
    /**Used to check if a value is valid for the state, returns the reason why it is not valid */
    check(value: W): string | undefined
    /**Returns the given value modified to be within the states limits, or just the given value */
    limit(value: W): W
}

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