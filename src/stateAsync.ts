import { State, StateOptions, StateSubscriber } from "./state"

type AsyncFunc<T> = (state: StateAsync<T>) => void;
type AsyncFuncSet<T> = (value: T, state: StateAsync<T>) => void;

/**Base for async states to make it easier*/
export class StateAsync<T> extends State<T> {
    protected _setup: (state: this) => void
    protected _teardown: (state: this) => void
    protected _singleGet: (state: this) => void
    protected _singleSet: ((value: T, state: this) => void) | undefined
    protected _hasValue: boolean = false;
    protected _promises: StateSubscriber<any>[] = [];
    protected _rejects: ((val: Error) => void)[] = [];

    constructor(setup: AsyncFunc<T>, teardown: AsyncFunc<T>, singleGet: AsyncFunc<T>, singleSet?: AsyncFuncSet<T>, options?: StateOptions) {
        super(<T>undefined);
        this._setup = setup;
        this._teardown = teardown;
        this._singleGet = singleGet;
        this._singleSet = singleSet;
        if (options) {
            this.options = options;
        }
    }

    /**This adds a function as a subscriber to the state
     * @param update set true to update subscriber*/
    subscribe<B = T>(func: StateSubscriber<B>, update?: boolean): typeof func {
        this._subscribers.push(func);
        if (this._subscribers.length === 1) {
            this._setup(this);
        }
        if (update) {
            this._promises.push(() => { this._hasValue = true; });
            this._promises.push(func);
        }
        return func;
    }

    /**This removes a function as a subscriber to the state*/
    unsubscribe<B = T>(func: StateSubscriber<B>): typeof func {
        let index = this._subscribers.indexOf(func);
        if (index != -1) {
            this._subscribers.splice(index, 1);
        }
        if (this._subscribers.length === 0) {
            this._hasValue = false;
            this._teardown(this);
        }
        return func;
    }

    /** This gets the current value of the state*/
    get get(): T | Promise<T> {
        if (this._hasValue) {
            return this._value;
        } else {
            const prom = new Promise<T>((a, b) => {
                this._promises.push(a);
                this._rejects.push(b);
            });
            this._singleGet(this);
            return prom;
        }
    }

    /** This sets the value of the state and updates all subscribers*/
    set set(val: T) {
        if (this._singleSet) {
            if (this._value !== val) {
                this._value = val;
                this.update(val);
            }
            this._singleSet(val, this);
        }
    }

    /** This sets the value of the state*/
    set setSilent(val: T) {
        if (this._singleSet) {
            this._value = val;
            this._singleSet(val, this);
        }
    }

    /**Setter for updating value with async data*/
    set asyncFulfill(val: T) {
        for (let i = 0; i < this._promises.length; i++) {
            this._promises[i](val);
        }
        this._promises = [];
        this._rejects = [];
        super.set = val;
    }

    /**Setter for updating value with async data*/
    set asyncReject(error: Error) {
        for (let i = 0; i < this._rejects.length; i++) {
            this._rejects[i](error);
        }
        this._promises = [];
        this._rejects = [];
    }

    // /**Adds compatability with promise */
    // then<TResult1 = T, TResult2 = never>(onfulfilled: ((value: T) => TResult1 | PromiseLike<TResult1>), onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>)): PromiseLike<TResult1 | TResult2> {
    //     const value = <PromiseLike<T>>this.get;
    //     if (typeof value?.then === 'function') {
    //         return value.then(onfulfilled, onrejected);
    //     } else {
    //         return new Promise((a) => {
    //             a(onfulfilled(<T>value))
    //         });
    //     }
    // }

    /**Adds compatability with promise */
    then<TResult1 = T, TResult2 = never>(onfulfilled: ((value: T) => TResult1 | PromiseLike<TResult1>), onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>)): PromiseLike<TResult1 | TResult2> {
        console.warn('YOYOYO1');
        if (this._hasValue) {
            console.warn('YOYOYO2');
            return new Promise((a) => { a(onfulfilled(<T>this._value)) });
        } else {
            console.warn('YOYOYO3');
            return new Promise((a, b) => {
                this._promises.push((val) => {
                    try {
                        a(onfulfilled(val))
                    } catch (error) {
                        b(error)
                    }
                });
                if (onrejected) {
                    this._rejects.push((val) => {
                        try {
                            a(onrejected(val))
                        } catch (error) {
                            b(error)
                        }
                    });
                }
                this._singleGet(this);
            });
        }
    }

    /** This method compares any value the states value, returns true if they are different*/
    compare(val: any): boolean | Promise<boolean> {
        if (this._hasValue) {
            return val !== this._value;
        } else {
            this._singleGet(this);
            return new Promise((a) => {
                this._promises.push(() => {
                    a(val !== this._value);
                });
            })
        }
    }

    /**Returns state value to json stringifier, since it is not async if the state value is async it can only return undefined*/
    toJSON(): T | undefined {
        if (this._hasValue) {
            return this._value;
        } else {
            return undefined;
        }
    }
}