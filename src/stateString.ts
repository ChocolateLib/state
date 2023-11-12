import { None, Ok, Option, Some } from "@chocolatelib/result";
import { StateStringLimits } from "./helpers";
import { StateBase } from "./stateBase";
import { StateRelated, StateRelater, StateResult, StateSetter, StateWrite } from "./types";


export class StateString<L extends {} = any> extends StateBase<string, L> implements StateWrite<string, string, L> {
    /**Creates a state which holds a string
     * @param init initial value for state, use undefined to indicate that state does not have a value yet
     * @param limiter limiter struct to limit string
     * @param related function returning the related states to this one*/
    constructor(
        init: StateResult<string>,
        setter?: StateSetter<string> | boolean,
        limiter?: StateStringLimits,
        related?: StateRelater<L>
    ) {
        super();
        if (setter)
            this.#setter = (setter === true ? value => Some(Ok(value)) : setter);
        if (limiter)
            this.#limit = limiter;
        if (related)
            this.#related = related;
        this.#value = init;
    }

    #value: StateResult<string>;
    #setter: StateSetter<string> | undefined;
    #limit: StateStringLimits | undefined;
    #related: StateRelater<L> | undefined;

    //Read
    async then<TResult1 = string>(func: ((value: StateResult<string>) => TResult1 | PromiseLike<TResult1>)): Promise<TResult1> {
        return await func(this.#value);
    }

    related(): Option<StateRelated<L>> {
        return (this.#related ? this.#related() : None())
    }

    //Write
    write(value: string): void {
        if (this.#setter && (this.#value as any).value !== value) {
            value = (this.#limit ? this.#limit.limit(value) : value);
            if ((this.#value as any).value !== value)
                this.#setter(value).map(this.set.bind(this));
        }
    }

    check(value: string): string | undefined {
        return (this.#limit ? this.#limit.check(value) : undefined)
    }

    limit(value: string): string {
        return (this.#limit ? this.#limit.limit(value) : value);
    }

    //Owner
    set(value: StateResult<string>) {
        this.#value = value;
        this.updateSubscribers(value);
    }
}