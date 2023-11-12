import { None, Ok, Option, Some } from "@chocolatelib/result";
import { StateNumberLimits } from "./helpers";
import { StateBase } from "./stateBase";
import { StateRelated, StateRelater, StateResult, StateSetter, StateWrite } from "./types";

export interface StateNumberRelated {
    min?: number
    max?: number
    decimals?: number
    unit?: number
}

export class StateNumber<L extends StateNumberRelated> extends StateBase<number, L> implements StateWrite<number, number, L> {
    /**Creates a state which holds a number
     * @param init initial value for state, use undefined to indicate that state does not have a value yet
     * @param limiter limiter struct to limit number
     * @param related function returning the related states to this one*/
    constructor(
        init: StateResult<number>,
        setter?: StateSetter<number> | boolean,
        limiter?: StateNumberLimits,
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

    #value: StateResult<number>;
    #setter: StateSetter<number> | undefined;
    #limit: StateNumberLimits | undefined;
    #related: StateRelater<L> | undefined;

    //Read
    async then<TResult1 = number>(func: ((value: StateResult<number>) => TResult1 | PromiseLike<TResult1>)): Promise<TResult1> {
        return await func(this.#value);
    }

    related(): Option<StateRelated<L>> {
        return (this.#related ? this.#related() : None())
    }

    //Write
    write(value: number): void {
        if (this.#setter && (this.#value as any).value !== value) {
            value = (this.#limit ? this.#limit.limit(value) : value);
            if ((this.#value as any).value !== value)
                this.#setter(value).map(this.set.bind(this));
        }
    }
    check(value: number): string | undefined {
        return (this.#limit ? this.#limit.check(value) : undefined)
    }

    limit(value: number): number {
        return (this.#limit ? this.#limit.limit(value) : value);
    }

    //Owner
    set(value: StateResult<number>) {
        this.#value = value;
        this.updateSubscribers(value);
    }
}