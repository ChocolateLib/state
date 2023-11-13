import { StateSubscriber, StateRead, StateResult } from "./types";
import { StateBase } from "./stateBase";
import { Err, Ok } from "@chocolatelib/result";
import { State } from "./state";

export class StateDerived<I, O = I, T extends StateRead<I>[] = []> extends StateBase<O> {
    /**Creates a state derives a value from other states
     * @param init initial value for state, use undefined to indicate that state does not have a value yet
     * @param getter function used to calculate the derived value of the states*/
    constructor(getter?: (value: StateResult<I>[]) => StateResult<O>, ...states: T) {
        super();
        if (getter)
            this.getter = getter;
        if (states)
            this.#states = [...states];
    }

    #valid: boolean = false;
    #buffer: StateResult<O> | undefined;

    #states: StateRead<I>[] = [];
    #stateBuffers: StateResult<I>[] = [];
    #stateSubscribers: StateSubscriber<I>[] = [];
    #calculatingValue: number = 0;

    protected getter(values: StateResult<I>[]): StateResult<O> {
        return values[0] as any;
    };

    async #calculate() {
        await undefined;
        this.#valid = true;
        this.#buffer = this.getter(this.#stateBuffers);
        this.updateSubscribers(this.#buffer);
        this.#calculatingValue = 1;
    }

    #connect() {
        this.#calculatingValue = 0;
        let count = this.#states.length;
        for (let i = 0; i < this.#states.length; i++) {
            this.#stateSubscribers[i] = this.#states[i].subscribe((value) => {
                if (this.#calculatingValue === 1) {
                    this.#stateBuffers[i] = value;
                    this.#calculatingValue = 2;
                    this.#calculate();
                } else if (this.#calculatingValue === 0 && !this.#stateBuffers[i]) {
                    this.#stateBuffers[i] = value;
                    count--;
                    if (count === 0) {
                        this.#calculatingValue = 2;
                        this.#calculate();
                    }
                } else
                    this.#stateBuffers[i] = value;
            }, true);
        }
    }

    #disconnect() {
        for (let i = 0; i < this.#states.length; i++)
            this.#states[i].unsubscribe(this.#stateSubscribers[i]);
        this.#stateSubscribers = [];
        this.#stateBuffers = [];
    }

    //Read
    subscribe<B extends StateSubscriber<O>>(func: B, update?: boolean): B {
        if (this.subscribers.length === 0) {
            this.subscribers.push(func);
            this.#connect();
            return func;
        }
        return super.subscribe(func, update);
    }

    unsubscribe<B extends StateSubscriber<O>>(func: B): B {
        if (this.subscribers.length === 1)
            this.#disconnect();
        return super.unsubscribe(func);
    }

    async then<TResult1 = O>(func: ((value: StateResult<O>) => TResult1 | PromiseLike<TResult1>)): Promise<TResult1> {
        if (this.#valid)
            return func(this.#buffer!);
        else if (this.#states.length)
            return func(this.getter(await Promise.all(this.#states)));
        else
            return func(Err({ reason: 'No states registered', code: 'INV' }));
    }

    //Owner
    setStates(...states: T) {
        if (this.subscribers.length) {
            this.#disconnect();
            this.#states = [...states];
            this.#connect();
        } else
            this.#states = [...states];
    }
}

export class StateAverage extends StateDerived<number, number, StateRead<number>[]> {
    /**Creates a state which keeps the avererage of the value of other states*/
    constructor(...states: StateRead<number>[]) {
        super(undefined, ...states);
    }
    protected getter(values: StateResult<number>[]) {
        let sum = 0;
        for (let i = 0; i < values.length; i++) {
            let value = values[i];
            if (value.ok)
                sum += value.value;
            else
                return value;
        }
        return Ok(sum / values.length);
    };
}

export class StateSummer extends StateDerived<number, number, StateRead<number>[]> {
    /**Creates a state which keeps the sum of the value of other states*/
    constructor(...states: StateRead<number>[]) {
        super(undefined, ...states);
    }
    protected getter(values: StateResult<number>[]) {
        let sum = 0;
        for (let i = 0; i < values.length; i++) {
            let value = values[i];
            if (value.ok)
                sum += value.value;
            else
                return value;
        }
        return Ok(sum);
    };
}