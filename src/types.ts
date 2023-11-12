import { Option, Result } from "@chocolatelib/result";

/**Shorthand for state result*/
export type StateResult<R> = Result<R, StateError>

/**Function used to subscribe to state changes */
export type StateSubscriber<R> = (value: StateResult<R>) => void

/**Struct returned when a state errors*/
export type StateError = {
    /**Description of the reason for the error*/
    reason: string,
    /**2-3 letter code for error eg CL = Connection lost*/
    code: string,
}

/**Struct returned when a state errors*/
export type StateSetter<R, W = R> = ((value: W) => Option<StateResult<R>>)

/**Function used to check if a value is within state limits*/
export type StateChecker<W> = (value: W) => string | undefined

/**Function used to limit value to withint state limits*/
export type StateLimiter<W> = (value: W) => W

/**Map of states related to a state */
export type StateRelated<R> = { [Property in keyof R]: StateRead<R[keyof R], any> | undefined }

/**Function used to return the relation state*/
export type StateRelater<L extends {} = any> = () => Option<StateRelated<L>>

export interface StateRead<R, L extends {} = any> {
    /**Allows getting value of state  */
    then<TResult1 = R>(func: ((value: StateResult<R>) => TResult1 | PromiseLike<TResult1>)): PromiseLike<TResult1>
    /**This adds a function as a subscriber to the state
     * @param update set true to update subscriber*/
    subscribe<B extends StateSubscriber<R>>(func: B, update?: boolean): B
    /**This removes a function as a subscriber to the state*/
    unsubscribe<B extends StateSubscriber<R>>(func: B): B
    /**Returns a map of related states to this state*/
    related(): Option<StateRelated<L>>
}

export interface StateWrite<R, W = R, L extends {} = any> extends StateRead<R, L> {
    /** This sets the value of the state and updates all subscribers */
    write(value: W): void
    /**Used to check if a value is valid for the state, returns the reason why it is not valid */
    check(value: W): string | undefined
    /**Returns the given value modified to be within the states limits, or just the given value */
    limit(value: W): W
}