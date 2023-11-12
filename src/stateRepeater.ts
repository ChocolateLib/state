import { Err } from "@chocolatelib/result";
import { StateBase } from "./stateBase";
import { StateRead, StateResult, StateSubscriber } from "./types";

export class StateRepeater<O, I> extends StateBase<O> {
    /**Creates a state which repeats the value of another state
     * @param state the state to repeat
     * @param getter function used to modify value repeated from state */
    constructor(state?: StateRead<I>, getter?: (value: StateResult<I>) => StateResult<O>) {
        super();
        if (getter)
            this.#getter = getter;
        this.#state = state;
    }

    #valid: boolean = false;
    #buffer: StateResult<O> | undefined;
    #state: StateRead<I> | undefined;
    #getter: ((value: StateResult<I>) => StateResult<O>) | undefined;
    #subscriber: ((value: StateResult<I>) => void) = (value) => {
        this.#valid = true;
        if (this.#getter)
            this.updateSubscribers(this.#getter(value));
        else
            this.updateSubscribers(value as any);
    };

    setState(state: StateRead<I> | undefined) {
        if (this.#state) {
            if (this.subscribers.length > 0)
                this.#state.unsubscribe(this.#subscriber);
            if (!state)
                this.#state = undefined;
        }
        if (state) {
            if (this.subscribers.length)
                state.subscribe(this.#subscriber);
            this.#state = state;
        }
    }

    subscribe<B extends StateSubscriber<O>>(func: B, update?: boolean): B {
        if (this.subscribers.length === 0 && this.#state) {
            this.subscribers.push(func);
            this.#state.subscribe(this.#subscriber, update);
            return func;
        }
        return super.subscribe(func, update);
    }

    unsubscribe<B extends StateSubscriber<O>>(func: B): B {
        if (this.subscribers.length === 1 && this.#state) {
            this.#valid = false
            this.#state.unsubscribe(this.#subscriber);
        }
        return super.unsubscribe(func);
    }

    async then<TResult1 = O>(func: ((value: StateResult<O>) => TResult1 | PromiseLike<TResult1>)): Promise<TResult1> {
        if (this.#valid)
            return func(this.#buffer!);
        else if (this.#state)
            if (this.#getter)
                return func(this.#getter(await this.#state));
            else
                return func(await this.#state as any);
        else
            return func(Err({ reason: 'No state registered', code: 'INV' }));
    }
}