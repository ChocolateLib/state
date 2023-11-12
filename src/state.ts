import { Ok, Result } from "@chocolatelib/result";
import { StateBase } from "./stateBase";
import { StateChecker, StateError, StateInfo, StateLimiter, StateWrite } from "./types";

/**Function called when user sets value*/
export type StateSetter<R, W extends R = R> = (value: W, set: State<R, W>) => void

export class State<R, W extends R = R> extends StateBase<R> implements StateWrite<R, W>, StateInfo<R> {
    /**Creates a state which holds a value
     * @param init initial value for state, use undefined to indicate that state does not have a value yet
     * @param setter function called when state value is set via setter, set true let write set it's value 
     * @param checker function to allow state users to check if a given value is valid for the state
     * @param limiter function to allow state users to limit a given value to state limit */
    constructor(init: R, setter?: StateSetter<R, W> | boolean, checker?: StateChecker<W>, limiter?: StateLimiter<W>) {
        super();
        if (setter)
            this.#setter = (setter === true ? this.set : setter);
        if (checker)
            this.#check = checker;
        if (limiter)
            this.#limit = limiter;
        this.#value = init;
    }

    #value: R;
    #setter: StateSetter<R, W> | undefined;
    #check: StateChecker<W> | undefined;
    #limit: StateLimiter<W> | undefined;

    //Read
    async then<TResult1 = R>(func: ((value: Result<R, StateError>) => TResult1 | PromiseLike<TResult1>)): Promise<TResult1> {
        return await func(Ok(this.#value));
    }

    //Write
    write(value: W): void {
        if (this.#setter && this.#value !== value) {
            this.#setter(value, this);
        }
    }
    check(value: W): string | undefined {
        return (this.#check ? this.#check(value) : undefined)
    }

    limit(value: W): W {
        return (this.#limit ? this.#limit(value) : value);
    }

    //Owner
    set(value: R) {
        this.#value = value;
        this._updateSubscribers(value);
    }
}