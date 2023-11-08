import { Ok, Result } from "@chocolatelib/result";
import { StateStringLimits } from "./helpers";
import { StateBase } from "./stateBase";
import { StateError, StateInfo, StateWrite } from "./types";

/**Function called when user sets value*/
export type StateStringSetter = (value: string, set: StateString) => void

export class StateString extends StateBase<string> implements StateWrite<string>, StateInfo<string> {
    /**Creates a state which holds a string
     * @param init initial value for state, use undefined to indicate that state does not have a value yet
     * @param limiter limiter struct to limit string*/
    constructor(init: string, setter?: StateStringSetter | boolean, limiter?: StateStringLimits) {
        super();
        if (setter)
            this.#setter = (setter === true ? this.set : setter);
        if (limiter)
            this.#limit = limiter;
        this.#value = init;
    }

    #value: string;
    #setter: StateStringSetter | undefined;
    #limit: StateStringLimits | undefined;

    //Read
    async then<TResult1 = string>(func: ((value: Result<string, StateError>) => TResult1 | PromiseLike<TResult1>)): Promise<TResult1> {
        return await func(Ok(this.#value));
    }

    //Write
    write(value: string): void {
        if (this.#setter)
            if (this.#value !== value) {
                value = (this.#limit ? this.#limit.limit(value) : value);
                if (this.#value !== value)
                    this.#setter(value, this);
            }
    }
    check(value: string): string | undefined {
        return (this.#limit ? this.#limit.check(value) : undefined)
    }

    limit(value: string): string {
        return (this.#limit ? this.#limit.limit(value) : value);
    }

    //Owner
    set(value: string) {
        this.#value = value;
        this._updateSubscribers(value);
    }
}