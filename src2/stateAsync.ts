import { State, StateOptions, StateSubscriber } from "./state"

type AsyncFunc<T> = (state: StateAsync<T>) => void;
type AsyncFuncSet<T> = (value: T, state: StateAsync<T>) => void;


/**Base for async states to make it easier*/
export class StateAsync<T> extends State<T | undefined> {
    protected _setup: (state: this) => void
    protected _teardown: (state: this) => void
    protected _singleGet: (state: this) => void
    protected _singleSet: ((value: T, state: this) => void) | undefined
    protected _hasValue: boolean = false;
    protected _promises: StateSubscriber<any>[] = [];
    protected _rejects: ((val: Error) => void)[] = [];

    constructor(setup: AsyncFunc<T>, teardown: AsyncFunc<T>, singleGet: AsyncFunc<T>, singleSet?: AsyncFuncSet<T>, placeholder?: T, options?: StateOptions) {
        super(placeholder);
        this._setup = setup;
        this._teardown = teardown;
        this._singleGet = singleGet;
        this._singleSet = singleSet;
        this.placeholder = placeholder;
        if (options) {
            this.options = options;
        }
    }

    /**Placeholder value used when no value is available*/
    readonly placeholder: T | undefined;

    /**This adds a function as a subscriber to the state
     * @param update set true to update subscriber*/
    subscribe(func: StateSubscriber<T | undefined>, update?: boolean): typeof func {
        this._subscribers.push(func);
        if (this._subscribers.length === 1) {
            this._setup(this);
        }
        if (update) {
            this._promises.push(func);
        }
        return func;
    }

    /**This removes a function as a subscriber to the state*/
    unsubscribe(func: StateSubscriber<T | undefined>): typeof func {
        let index = this._subscribers.indexOf(func);
        if (index != -1) {
            this._subscribers.splice(index, 1);
        }
        if (this._subscribers.length === 0) {
            this._teardown(this);
        }
        return func;
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
        this._hasValue = true;
        for (let i = 0; i < this._promises.length; i++) {
            this._promises[i](val);
        }
        this._promises = [];
        this._rejects = [];
        super.set = val;
    }

    /**Setter for updating value with async data*/
    set asyncReject(error: Error) {
        this._hasValue = false;
        for (let i = 0; i < this._rejects.length; i++) {
            this._rejects[i](error);
        }
        this._promises = [];
        this._rejects = [];
        super.set = undefined;
    }


    /**Adds compatability with promise */
    then<TResult1 = T, TResult2 = never>(onfulfilled: ((value: T) => TResult1 | PromiseLike<TResult1>), onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>)): PromiseLike<TResult1 | TResult2> {
        if (this._hasValue) {
            return new Promise((a) => { a(onfulfilled(<T>this._value)) });
        } else {
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
}