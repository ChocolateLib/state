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

/**Function used to limit value to within state limits*/
export type StateLimiter<W> = {
    /**Limits given value to valid range if possible returns None if not possible */
    limit: (value: W) => Option<W>,
    /**Checks if the value is valid and returns reason for invalidity */
    check: (value: W) => string | undefined
}

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

export interface StateWrite<R, W = R, L extends {} = any> extends StateRead<R, L>, StateLimiter<W> {
    /** This sets the value of the state and updates all subscribers */
    write(value: W): void
}