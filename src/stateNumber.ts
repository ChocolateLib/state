import { Ok, Result } from "@chocolatelib/result";
import { StateNumberLimits } from "./helpers";
import { StateBase } from "./stateBase";
import { StateError, StateInfo, StateWrite } from "./types";

/**Function called when user sets value*/
export type StateNumberSetter = (value: number, set: StateNumber) => void

export class StateNumber extends StateBase<number> implements StateWrite<number>, StateInfo<number> {
    /**Creates a state which holds a number
     * @param init initial value for state, use undefined to indicate that state does not have a value yet
     * @param limiter limiter struct to limit number*/
    constructor(init: number, setter?: StateNumberSetter | boolean, limiter?: StateNumberLimits) {
        super();
        if (setter)
            this.#setter = (setter === true ? this.set : setter);
        if (limiter)
            this.#limit = limiter;
        this.#value = init;
    }

    #value: number;
    #setter: StateNumberSetter | undefined;
    #limit: StateNumberLimits | undefined;

    //Read
    async then<TResult1 = number>(func: ((value: Result<number, StateError>) => TResult1 | PromiseLike<TResult1>)): Promise<TResult1> {
        return await func(Ok(this.#value));
    }

    //Write
    write(value: number): void {
        if (this.#setter)
            if (this.#value !== value) {
                value = (this.#limit ? this.#limit.limit(value) : value);
                if (this.#value !== value)
                    this.#setter(value, this);
            }
    }
    check(value: number): string | undefined {
        return (this.#limit ? this.#limit.check(value) : undefined)
    }

    limit(value: number): number {
        return (this.#limit ? this.#limit.limit(value) : value);
    }

    //Owner
    set(value: number) {
        this.#value = value;
        this._updateSubscribers(value);
    }
}