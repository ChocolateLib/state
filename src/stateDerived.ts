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
            this.#states = [...states];
    }

    #valid: boolean = false;
    #buffer: Result<O, StateError> | undefined;

    #states: StateRead<I>[] = [];
    #stateBuffers: Result<I, StateError>[] = [];
    #stateSubscribers: StateSubscriber<I>[] = [];

    #calculatingValue: boolean = false;

    protected _getter(values: Result<I, StateError>[]): Result<O, StateError> {
        return values[0] as any;
    };

    async #calculate() {
        await undefined;
        this.#valid = true;
        this.#buffer = this._getter(this.#stateBuffers);
        if (this.#buffer.ok)
            this._updateSubscribers(this.#buffer.value);
        else
            this._updateSubscribers(undefined as any, this.#buffer.error);
        this.#calculatingValue = false;
    }

    #connect() {
        for (let i = 0; i < this.#states.length; i++) {
            this.#stateSubscribers[i] = this.#states[i].subscribe((value, error) => {
                this.#stateBuffers[i] = error ? Err(error) : Ok(value);
                if (!this.#calculatingValue) {
                    this.#calculatingValue = true;
                    this.#calculate();
                }
            }, true);
        }
    }

    #disconnect() {
        for (let i = 0; i < this.#states.length; i++)
            this.#states[i].unsubscribe(this.#stateSubscribers[i]);
        this.#stateSubscribers = [];
    }

    //Read
    subscribe<B extends StateSubscriber<O>>(func: B, update?: boolean): B {
        if (this._subscribers.length === 0) {
            this._subscribers.push(func);
            this.#connect();
            return func;
        }
        return super.subscribe(func, update);
    }

    unsubscribe<B extends StateSubscriber<O>>(func: B): B {
        if (this._subscribers.length === 1)
            this.#disconnect();
        return super.unsubscribe(func);
    }

    async then<TResult1 = O>(func: ((value: Result<O, StateError>) => TResult1 | PromiseLike<TResult1>)): Promise<TResult1> {
        if (this.#valid)
            return func(this.#buffer!);
        else if (this.#states.length)
            return func(this._getter(await Promise.all(this.#states)));
        else
            return func(Err({ reason: 'No states registered', code: 'INV' }));
    }
    //Owner
    setStates(...states: StateRead<I>[]) {
        if (this._subscribers.length) {
            this.#disconnect();
            this.#states = [...states];
            this.#connect();
        } else
            this.#states = [...states];
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