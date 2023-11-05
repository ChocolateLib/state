import { StateSubscriber, StateRead, StateInfo, StateError } from "./types";
import { StateBase } from "./stateBase";
import { Err, Ok, Result } from "@chocolatelib/result";

type Getter<O, I> = (value: Result<I, StateError>[]) => Result<O, StateError>

export class StateDerived<O, I> extends StateBase<O> implements StateInfo<O> {
    /**Creates a state derives a value from other states
     * @param init initial value for state, use undefined to indicate that state does not have a value yet
     * @param getter function used to calculate the derived value of the states*/
    constructor(getter?: Getter<O, I>, ...states: StateRead<I>[]) {
        super();
        if (getter)
            this._getter = getter;
        if (states)
            this._states = [...states];
    }

    private _valid: boolean = false;
    private _buffer: Result<O, StateError> | undefined;

    private _states: StateRead<I>[] = [];
    private _stateBuffers: Result<I, StateError>[] = [];
    private _stateSubscribers: StateSubscriber<I>[] = [];

    private _calculatingValue: boolean = false;

    protected _getter(values: Result<I, StateError>[]): Result<O, StateError> {
        return values[0] as any;
    };

    private async _calculate() {
        await undefined;
        this._valid = true;
        this._buffer = this._getter(this._stateBuffers);
        if (this._buffer.ok)
            this._updateSubscribers(this._buffer.value);
        else
            this._updateSubscribers(undefined as any, this._buffer.error);
        this._calculatingValue = false;
    }

    private _connect() {
        for (let i = 0; i < this._states.length; i++) {
            this._stateSubscribers[i] = this._states[i].subscribe((value, error) => {
                this._stateBuffers[i] = error ? Err(error) : Ok(value);
                if (!this._calculatingValue) {
                    this._calculatingValue = true;
                    this._calculate();
                }
            }, true);
        }
    }

    private _disconnect() {
        for (let i = 0; i < this._states.length; i++)
            this._states[i].unsubscribe(this._stateSubscribers[i]);
        this._stateSubscribers = [];
    }

    //Read
    subscribe<B extends StateSubscriber<O>>(func: B, update?: boolean): B {
        if (this._subscribers.length === 0) {
            this._subscribers.push(func);
            this._connect();
            return func;
        }
        return super.subscribe(func, update);
    }

    unsubscribe<B extends StateSubscriber<O>>(func: B): B {
        if (this._subscribers.length === 1)
            this._disconnect();
        return super.unsubscribe(func);
    }

    async then<TResult1 = O>(func: ((value: Result<O, StateError>) => TResult1 | PromiseLike<TResult1>)): Promise<TResult1> {
        if (this._valid)
            return func(this._buffer!);
        else if (this._states.length)
            return func(this._getter(await Promise.all(this._states)));
        else
            return func(Err({ reason: 'No states registered', code: 'INV' }));
    }
    //Owner
    setStates(...states: StateRead<I>[]) {
        if (this._subscribers.length) {
            this._disconnect();
            this._states = [...states];
            this._connect();
        } else
            this._states = [...states];
    }
}

export class StateAverage extends StateDerived<number, number> {
    /**Creates a state which keeps the avererage of the value of other states*/
    constructor(...states: StateRead<number>[]) {
        super(undefined, ...states);
    }
    protected _getter(values: Result<number, StateError>[]) {
        let sum = 0;
        for (let i = 0; i < values.length; i++)
            if (values[i].ok)
                //@ts-expect-error
                sum += values[i].value;
            else
                return values[i];
        return Ok(sum / values.length);
    };
}

export class StateSummer extends StateDerived<number, number> {
    /**Creates a state which keeps the sum of the value of other states*/
    constructor(...states: StateRead<number>[]) {
        super(undefined, ...states);
    }
    protected _getter(values: Result<number, StateError>[]) {
        let sum = 0;
        for (let i = 0; i < values.length; i++)
            if (values[i].ok)
                //@ts-expect-error
                sum += values[i].value;
            else
                return values[i];
        return Ok(sum);
    };
}