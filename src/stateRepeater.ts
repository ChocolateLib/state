import { Err, Result } from "@chocolatelib/result";
import { StateBase } from "./stateBase";
import { StateError, StateInfo, StateRead, StateSubscriber } from "./types";

type Getter<O, I> = (value: I, error?: StateError) => Result<O, StateError>

export class StateRepeater<O, I> extends StateBase<O> implements StateInfo<O> {
    /**Creates a state which repeats the value of another state
     * @param state the state to repeat
     * @param getter function used to modify value repeated from state */
    constructor(state?: StateRead<I>, getter?: Getter<O, I>) {
        super();
        if (getter)
            this.#getter = getter;
        this.#state = state;
    }

    /**Is high when buffer is valid */
    #valid: boolean = false;
    /**Buffer of last valid value */
    #buffer: Result<O, StateError> | undefined;
    /**State to repeat */
    #state: StateRead<I> | undefined;
    /** */
    #getter: Getter<O, I> | undefined;

    private _subscriber(value: I, error?: StateError) {
        this.#valid = true;
        if (this.#getter) {
            let val = this.#getter(value, error);
            //@ts-expect-error
            this._updateSubscribers(val.value, val.error);
        } else
            this._updateSubscribers(value as any, error);
    };

    setState(state: StateRead<I> | undefined) {
        if (this.#state) {
            if (this._subscribers.length > 0)
                this.#state.unsubscribe(this._subscriber);
            if (!state)
                this.#state = undefined;
        }
        if (state) {
            if (this._subscribers.length)
                this._subscriber = state.subscribe(this._subscriber.bind(this));
            this.#state = state;
        }
    }

    subscribe<B extends StateSubscriber<O>>(func: B, update?: boolean): B {
        if (this._subscribers.length === 0 && this.#state) {
            this._subscribers.push(func);
            this.#state.subscribe(this._subscriber.bind(this), update);
            return func;
        }
        return super.subscribe(func, update);
    }

    unsubscribe<B extends StateSubscriber<O>>(func: B): B {
        if (this._subscribers.length === 1 && this.#state) {
            this.#valid = false
            this.#state.unsubscribe(this._subscriber);
        }
        return super.unsubscribe(func);
    }

    async then<TResult1 = O>(func: ((value: Result<O, StateError>) => TResult1 | PromiseLike<TResult1>)): Promise<TResult1> {
        if (this.#valid)
            return func(this.#buffer!);
        else if (this.#state)
            if (this.#getter) {
                let value = await this.#state;
                //@ts-expect-error
                return func(this.#getter(value.value, value.error));
            } else
                return func(await this.#state as any);
        else
            return func(Err({ reason: 'No state registered', code: 'INV' }));
    }
}