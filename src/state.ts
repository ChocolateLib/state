import { None, Ok, Option, Some } from "@chocolatelib/result";
import { StateBase } from "./stateBase";
import { StateChecker, StateLimiter, StateRelated, StateRelater, StateResult, StateSetter, StateWrite } from "./types";

export class State<R, W = R, L extends {} = any> extends StateBase<R, L> implements StateWrite<R, W, L> {
    /**Creates a state which holds a value
     * @param init initial value for state, use undefined to indicate that state does not have a value yet
     * @param setter function called when state value is set via setter, set true let write set it's value 
     * @param checker function to allow state users to check if a given value is valid for the state
     * @param limiter function to allow state users to limit a given value to state limit
     * @param related function returning the related states to this one*/
    constructor(
        init: StateResult<R>,
        setter?: StateSetter<R, W> | boolean,
        checker?: StateChecker<W>,
        limiter?: StateLimiter<W>,
        related?: StateRelater<L>
    ) {
        super();
        if (setter)
            this.#setter = (setter === true ? value => Some(Ok(value as any)) : setter);
        if (checker)
            this.#check = checker;
        if (limiter)
            this.#limit = limiter;
        if (related)
            this.#related = related;
        this.#value = init;
    }

    #value: StateResult<R>;
    #setter: StateSetter<R, W> | undefined;
    #check: StateChecker<W> | undefined;
    #limit: StateLimiter<W> | undefined;
    #related: StateRelater<L> | undefined;

    //Read
    async then<TResult1 = R>(func: ((value: StateResult<R>) => TResult1 | PromiseLike<TResult1>)): Promise<TResult1> {
        return func(this.#value);
    }

    related(): Option<StateRelated<L>> {
        return (this.#related ? this.#related() : None())
    }

    //Write
    write(value: W): void {
        if (this.#setter && (this.#value as any).value !== value)
            this.#setter(value).map(this.set.bind(this));
    }
    check(value: W): string | undefined {
        return (this.#check ? this.#check(value) : undefined)
    }

    limit(value: W): W {
        return (this.#limit ? this.#limit(value) : value);
    }

    //Owner
    set(value: StateResult<R>) {
        this.#value = value;
        this.updateSubscribers(value);
    }
}