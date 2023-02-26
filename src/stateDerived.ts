import { State, StateSubscriber, StateLike } from "./state";

/**Use this type when you want to have an argument StateDerived with multiple types, this example will only work with the StateDerivedLike*/
export interface StateDerivedLike<T, I> extends StateLike<T | undefined> {
    /**Sets the states to derive from*/
    set states(states: StateLike<I>[])
}

type WriteFunc<T, I> = (newValue: T, values: I[], valuesBuffer: I[], oldValue?: T) => void

/**State deriving a value from multiple other states
 * @param T type of value derived from states
 * @param I allowed types for */
export class StateDerived<T, I> extends State<T | undefined> {
    protected _states: StateLike<I>[];
    protected _stateBuffers: I[] = [];
    protected _stateSubscribers: StateSubscriber<I>[] = [];

    protected _needOld: boolean = false;
    protected _hasValue: boolean = false;
    protected _gettingValue: boolean = false;
    protected _promises: ((value: T) => void)[] = [];

    readonly readFunc: (val: I[]) => T;
    readonly writeFunc: WriteFunc<T, I> | undefined;
    private _async: boolean = false;

    /**State deriving a value from multiple other states
     * @param states list of states to derive from
     * @param readFunc function to use for deriving values
     * @param writeFunc function used to reverse derive
     * @param needOld set true if the write function need the old value to function*/
    constructor(readFunc: (values: I[]) => T, states: StateLike<I>[] = [], writeFunc?: WriteFunc<T, I>, needOld: boolean = false) {
        super(undefined);
        this._states = [...states];
        for (let i = 0; i < states.length; i++) {
            this._async = this._async || states[i].async;
        }
        this.readFunc = readFunc;
        this.writeFunc = writeFunc;
        this._needOld = needOld;
    }

    /**Returns if the state is read only*/
    get readonly(): boolean { return !Boolean(this.writeFunc); }

    /**Returns if the state is async and will return an async value*/
    get async(): boolean { return this._async; }

    /**Sets the states to derive from*/
    set states(states: StateLike<I>[]) {
        if (this._subscribers.length) {
            this._disconnect();
        }
        this._states = [...states];
        this._async = false;
        for (let i = 0; i < states.length; i++) {
            this._async = this._async || states[i].async;
        }
        if (this._subscribers.length) {
            this._connect();
        }
    }

    /**This get the current value */
    get get(): T | Promise<T | undefined> | undefined {
        if (this._states.length === 0) { return undefined }
        if (this._hasValue) {
            return this._value;
        }
        if (!this._async) {
            for (let i = 0; i < this._states.length; i++) {
                this._stateBuffers[i] = <I>this._states[i].get;
            }
            return this.readFunc(this._stateBuffers);
        }
        return new Promise(async (a) => {
            this._promises.push(a);
            if (!this._gettingValue) {
                this._gettingValue = true;
                this._promises.push(() => { this._gettingValue = false; });
                this._setasync = await Promise.all(this._states);
            }
        })
    }

    /**This sets the value and dispatches an event*/
    set set(value: T) {
        if (this._states.length === 0 || !this.writeFunc) { return; }
        if (this._hasValue || !this._needOld) {
            let values: I[] = Array(this._states.length);
            this.writeFunc(value, values, this._stateBuffers, <T>this._value);
            for (let i = 0; i < this._states.length; i++) {
                this._states[i].set = values[i];
            }
            return
        }
        if (!this._async) {
            for (let i = 0; i < this._states.length; i++) {
                this._stateBuffers[i] = <I>this._states[i].get;
            }
            let values: I[] = Array(this._states.length);
            this.writeFunc(value, values, this._stateBuffers, <T>this.readFunc(this._stateBuffers));
            for (let i = 0; i < this._states.length; i++) {
                this._states[i].set = values[i];
            }
            return;
        }
        (async () => {
            let oldValue = await this.get;
            let values: I[] = Array(this._states.length);
            (<WriteFunc<T, I>>this.writeFunc)(value, values, this._stateBuffers, <T>oldValue);
            for (let i = 0; i < this._states.length; i++) {
                this._states[i].set = values[i];
            }
        })()
    }

    protected set _setasync(values: I[]) {
        this._value = this.readFunc(values);
        for (let i = 0; i < this._promises.length; i++) {
            this._promises[i](this._value);
        }
        this._promises = [];
        this.update(this._value);
    }

    /**This adds a function as a subscriber to the state
     * @param update set true to update subscriber*/
    subscribe(func: StateSubscriber<T | undefined>, update?: boolean): StateSubscriber<T | undefined> {
        this._subscribers.push(func);
        if (update) {
            this._promises.push(func);
        }
        if (this._subscribers.length === 1) {
            this._connect();
        }
        return func;
    }

    /**This removes a function as a subscriber to the state*/
    unsubscribe(func: StateSubscriber<T | undefined>): StateSubscriber<T | undefined> {
        let index = this._subscribers.indexOf(func);
        if (index != -1) {
            this._subscribers.splice(index, 1);
        }
        if (this._subscribers.length === 0) {
            this._disconnect();
        }
        return func;
    }

    /**Connects listeners to all values*/
    private _connect() {
        for (let i = 0; i < this._states.length; i++) {
            this._stateSubscribers[i] = this._states[i].subscribe((val) => {
                this._stateBuffers[i] = val;
                if (!this._gettingValue) {
                    this._gettingValue = true;
                    (async () => {
                        await undefined;
                        this._setasync = this._stateBuffers;
                        this._gettingValue = false;
                    })();
                }
            });
        }
    }

    /**Disconnects listeners from all values*/
    private _disconnect() {
        for (let i = 0; i < this._states.length; i++) {
            this._states[i].unsubscribe(this._stateSubscribers[i]);
        }
        this._stateSubscribers = [];
    }
}