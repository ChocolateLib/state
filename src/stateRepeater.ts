import { Err, Ok, Result } from "@chocolatelib/result";
import { StateBase } from "./stateBase";
import { StateError, StateInfo, StateRead, StateSubscriber } from "./types";

type Getter<O, I> = (value: Result<I, StateError>) => Result<O, StateError>

export class StateRepeater<O, I> extends StateBase<O> implements StateInfo<O> {
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
    private _buffer: Result<O, StateError> | undefined;
    private _state: StateRead<I> | undefined;
    private _getter: Getter<O, I> | undefined;

    private _subscriber(value: I, error?: StateError) {
        this._valid = true;
        this._buffer = (this._getter ? this._getter(error ? Err(error) : Ok(value)) : <any>value);
        if (this._buffer!.ok) {
            this._updateSubscribers(this._buffer!.value, error);
        } else {
            this._updateSubscribers(undefined as any);
        }
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

    subscribe<B extends StateSubscriber<O>>(func: B, update?: boolean): B {
        if (this._subscribers.length === 0 && this._state) {
            this._subscribers.push(func);
            this._state.subscribe(this._subscriber.bind(this));
            return func;
        }
        return super.subscribe(func, update);
    }

    unsubscribe<B extends StateSubscriber<O>>(func: B): B {
        if (this._subscribers.length === 1 && this._state) {
            this._valid = false
            this._state.unsubscribe(this._subscriber);
        }
        return super.unsubscribe(func);
    }

    async then<TResult1 = O>(func: ((value: Result<O, StateError>) => TResult1 | PromiseLike<TResult1>)): Promise<TResult1> {
        if (this._valid) {
            return func(this._buffer!);
        } else if (this._state) {
            return func((this._getter ? this._getter(await this._state) : await this._state as any));
        } else {
            return func(Err({ reason: 'No state registered', code: 'INV' }));
        }
    }
}