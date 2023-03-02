import { State, StateInfo, StateSubscriber } from "./state";

export interface StateDerivedOptions {
    info?: StateInfo
}

type WriteFunc<T, I> = (newValue: T, values: I[], valuesBuffer: I[], oldValue?: T) => void

/**State deriving a value from multiple other states
 * @param T type of value derived from states
 * @param I allowed types for */
export class StateDerived<T, I> extends State<T | undefined> {
    protected _states: State<I>[];
    protected _stateBuffers: I[] = [];
    protected _stateSubscribers: StateSubscriber<I>[] = [];

    protected _needOld: boolean = false;
    protected _hasValue: boolean = false;
    protected _gettingValue: boolean = false;

    protected _promises: StateSubscriber<any>[] = [];
    protected _rejects: StateSubscriber<any>[] = [];

    readonly readFunc: (val: I[]) => T;
    readonly writeFunc: WriteFunc<T, I> | undefined;

    /**State deriving a value from multiple other states
     * @param states list of states to derive from
     * @param readFunc function to use for deriving values
     * @param writeFunc function used to reverse derive
     * @param needOld set true if the write function need the old value to work*/
    constructor(readFunc: (values: I[]) => T, states: State<I>[] = [], writeFunc?: WriteFunc<T, I>, needOld: boolean = false, options?: StateDerivedOptions) {
        super(undefined);
        this._states = [...states];
        this.readFunc = readFunc;
        this.writeFunc = writeFunc;
        this._needOld = needOld;
        if (options) {
            this.options = options;
        }
    }

    /**Sets the states to derive from*/
    set states(states: State<I>[]) {
        if (this._subscribers.length) {
            this._disconnect();
        }
        this._states = [...states];
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
        for (let i = 0; i < this._states.length; i++) {
            const value = <Promise<I>>this._states[i].get;
            if (typeof value?.then === 'function') {
                return new Promise(async (a, b) => {
                    try {
                        let values = await Promise.all(this._states.slice(i))
                        for (let y = 0; y < values.length; y++) {
                            this._stateBuffers[i + y] = values[y];
                        }
                        a(this.readFunc(this._stateBuffers));
                    } catch (error) {
                        b(error);
                    }
                })
            } else {
                this._stateBuffers[i] = <I>value;
            }
        }
        return this.readFunc(this._stateBuffers);
    }

    /**This sets the value and dispatches an event*/
    set set(value: T) {
        if (this._states.length === 0 || !this.writeFunc) { return; }
        if (this._hasValue || !this._needOld) {
            const values: I[] = Array(this._states.length);
            this.writeFunc(value, values, this._stateBuffers, <T>this._value);
            for (let i = 0; i < this._states.length; i++) {
                this._states[i].set = values[i];
            }
            return
        }
        // if (!this._async) {
        //     for (let i = 0; i < this._states.length; i++) {
        //         this._stateBuffers[i] = <I>this._states[i].get;
        //     }
        //     const values: I[] = Array(this._states.length);
        //     this.writeFunc(value, values, this._stateBuffers, <T>this.readFunc(this._stateBuffers));
        //     for (let i = 0; i < this._states.length; i++) {
        //         this._states[i].set = values[i];
        //     }
        //     return;
        // }
        // (async () => {
        //     const oldValue = await this.get;
        //     const values: I[] = Array(this._states.length);
        //     (<WriteFunc<T, I>>this.writeFunc)(value, values, this._stateBuffers, <T>oldValue);
        //     for (let i = 0; i < this._states.length; i++) {
        //         this._states[i].set = values[i];
        //     }
        // })()
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
    subscribe<B = T>(func: StateSubscriber<B>, update?: boolean): typeof func {
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
    unsubscribe<B = T>(func: StateSubscriber<B>): typeof func {
        const index = this._subscribers.indexOf(func);
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

    /**Options of state */
    set options(options: StateDerivedOptions) {
        if (options.info) {
            //@ts-expect-error
            this.info = options.info;
        }
        this._updateOptions();
    }
}