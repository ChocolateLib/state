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
    protected _needOld: boolean;
    protected _gettingValue: boolean = false;

    readonly readFunc: (val: I[]) => T;
    readonly writeFunc: WriteFunc<T, I> | undefined;

    /**State deriving a value from multiple other states
     * @param states list of states to derive from
     * @param readFunc function to use for deriving values
     * @param writeFunc function used to reverse derive
     * @param needOld set true if the write function need the old value to work*/
    constructor(readFunc: (values: I[]) => T, states: State<I>[] = [], writeFunc?: WriteFunc<T, I>, options?: StateDerivedOptions) {
        super(undefined);
        this._states = [...states];
        this.readFunc = readFunc;
        this.writeFunc = writeFunc;
        this._needOld = writeFunc?.length === 4;
        if (options) {
            this.options = options;
        }
    }

    /**Placeholder value used when note states are not provided*/
    readonly placeholder: T | undefined;

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

    /**Adds compatability with promise */
    then<TResult1 = T | undefined, TResult2 = never>(onfulfilled: ((value: T | undefined) => TResult1 | PromiseLike<TResult1>), onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>)): PromiseLike<TResult1 | TResult2> {
        if (this._states.length === 0) {
            return new Promise((a) => { a(onfulfilled(this.placeholder)) });
        }
        return Promise.all(this._states).then((val) => {
            this._stateBuffers = val;
            return onfulfilled(this.readFunc(val))
        }, onrejected);
    }

    /**This sets the value and dispatches an event*/
    set set(value: T) {
        if (this._states.length === 0) {
            return;
        }
        if (this._needOld) {
            this.then((oldValue) => {
                if (this.writeFunc) {
                    const values: I[] = Array(this._states.length);
                    this.writeFunc(value, values, this._stateBuffers, oldValue);
                    for (let i = 0; i < this._states.length; i++) {
                        this._states[i].set = values[i];
                    }
                }
            })
        } else {
            if (this.writeFunc) {
                const values: I[] = Array(this._states.length);
                this.writeFunc(value, values, this._stateBuffers);
                for (let i = 0; i < this._states.length; i++) {
                    this._states[i].set = values[i];
                }
            }
        }
    }

    /**This adds a function as a subscriber to the state
     * @param update set true to update subscriber*/
    subscribe(func: StateSubscriber<T | undefined>, update?: boolean): typeof func {
        if (this._subscribers.length === 0) {
            this._connect();
        }
        return super.subscribe(func, update);
    }

    /**This removes a function as a subscriber to the state*/
    unsubscribe(func: StateSubscriber<T | undefined>): typeof func {
        if (this._subscribers.length === 1) {
            this._disconnect();
        }
        return super.unsubscribe(func);
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
                        super.set = this.readFunc(this._stateBuffers);
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
        if ('placeholder' in options) {
            //@ts-expect-error
            this.placeholder = options.placeholder;
            if (this._states.length && this.inUse) {
                this.update(this.placeholder);
            }
        }
        this._updateOptions();
    }
}