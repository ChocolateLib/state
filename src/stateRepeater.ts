import { StateBase } from "./stateBase";
import { StateInfo, StateRead, StateSubscriber } from "./types";

type Getter<T, I> = (value: I) => T

export class StateRepeater<O, I> extends StateBase<O | undefined> implements StateInfo<O | undefined> {
    /**Creates a state which repeats the value of another state
     * @param state the state to repeat
     * @param getter function used to modify value repeated from state */
    constructor(state?: StateRead<I>, getter?: Getter<O, I>) {
        super();
        if (getter)
            this._getter = getter;
        this._state = state;
    }

    private _valid: boolean = false;
    private _buffer: O | undefined;
    private _state: StateRead<I> | undefined;
    private _getter: Getter<O, I> | undefined;

    private _subscriber(value: I) {
        this._valid = true;
        this._buffer = (this._getter ? this._getter(value) : <any>value);
        this._updateSubscribers(this._buffer);
    };

    setState(state: StateRead<I> | undefined) {
        if (this._state) {
            if (this._subscribers.length > 0)
                this._state.unsubscribe(this._subscriber);
            if (!state)
                this._state = undefined;
        }
        if (state) {
            if (this._subscribers.length)
                this._subscriber = state.subscribe(this._subscriber.bind(this));
            this._state = state;
        }
    }

    subscribe<B extends StateSubscriber<O | undefined>>(func: B, update?: boolean): B {
        if (this._subscribers.length === 0 && this._state) {
            this._subscribers.push(func);
            this._state.subscribe(this._subscriber.bind(this));
            return func;
        }
        return super.subscribe(func, update);
    }

    unsubscribe<B extends StateSubscriber<O | undefined>>(func: B): B {
        if (this._subscribers.length === 1 && this._state) {
            this._valid = false
            this._state.unsubscribe(this._subscriber);
        }
        return super.unsubscribe(func);
    }

    async then<TResult1 = O>(func: ((value: O | undefined) => TResult1 | PromiseLike<TResult1>)): Promise<TResult1> {
        if (this._valid) {
            return func(<O>this._buffer);
        } else if (this._state) {
            return func((this._getter ? this._getter(await this._state) : <any>await this._state));
        } else {
            return func(undefined);
        }
    }
}