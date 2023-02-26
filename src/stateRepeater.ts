import { StateSubscriber, State, StateLike } from "./state";

/**Use this type when you want to have an argument StateRepeater with multiple types, this example will only work with the StateRepeaterLike*/
export interface StateRepeaterLike<T, I> extends StateLike<T | undefined> {
    /**Changes the state being repeated*/
    set state(state: StateLike<I> | undefined)
    /**Returns the repeated state*/
    get state(): StateLike<I> | undefined
}

let repeatFunc = <T, I>(val: T) => { return <I><any>val }

/**State repeater
 * @param T type of repeater value 
 * @param I type of repeated state value*/
export class StateRepeater<T, I> extends State<T | undefined> {
    private _state: StateLike<I> | undefined;
    private _subscriber: StateSubscriber<I> | undefined;
    readonly readFunc: (val: I) => T;
    readonly writeFunc: ((val: T) => I) | undefined;
    private _async: boolean;

    /**State repeater
     * @param state value to repeat
     * @param readFunc mapper function to change original value for users of the proxy
     * @param writeFunc mapper function to change values set on the proxy before relaying them to the original*/
    constructor(state?: StateLike<I> | undefined, readFunc: (val: I) => T = repeatFunc, writeFunc?: (val: T) => I) {
        super(undefined);
        delete this._value;
        this._state = state;
        this._async = (state ? state.async : false);
        this.readFunc = readFunc;
        this.writeFunc = writeFunc;
    }

    /**Returns if the state is read only*/
    get readonly(): boolean { return !Boolean(this.writeFunc); }

    /**Returns if the state is async and will return an async value*/
    get async(): boolean { return this._async; }

    /**Changes the state being repeated*/
    set state(state: StateLike<I> | undefined) {
        if (this._state) {
            if (this._subscriber) {
                this._state.unsubscribe(this._subscriber);
            }
            this._subscriber = undefined;
            if (!state) {
                this._state = undefined;
            }
        }
        if (state) {
            if (this._subscribers.length) {
                this._subscriber = state.subscribe((val) => {
                    super.set = this.readFunc(val);
                }, true);
            }
            this._state = state;
            this._async = state.async;
        }
    }

    /**Returns the repeated state*/
    get state(): StateLike<I> | undefined { return this._state; }

    /**This adds a function as a subscriber to the state
     * @param update set true to update subscriber*/
    subscribe(func: StateSubscriber<T | undefined>, update?: boolean): typeof func {
        this._subscribers.push(func);
        if (this._state && !this._subscriber) {
            delete this._value;
            this._subscriber = this._state.subscribe((val) => {
                super.set = this.readFunc(val);
            });
        }
        if (update) {
            if (this._async) {
                (<Promise<T>>this.get).then((val) => { func(val); })
            } else {
                func(<T>this.get);
            }
        }
        return func;
    }

    /**This removes a function as a subscriber to the state*/
    unsubscribe(func: StateSubscriber<T | undefined>): typeof func {
        let index = this._subscribers.indexOf(func);
        if (index != -1) {
            this._subscribers.splice(index, 1);
        }
        if (this._subscribers.length === 0 && this._subscriber && this._state) {
            this._state.unsubscribe(this._subscriber);
            delete this._subscriber;
        }
        return func;
    }

    /**This gets the value from the proxied value*/
    get get(): T | Promise<T> | undefined {
        if (this._state) {
            if ('_value' in this) {
                return this._value;
            }
            if ((<this>this)._async) {
                return (<Promise<I>>(<StateLike<I>>(<this>this)._state).get).then((val) => { return this.readFunc(val); })
            } else {
                return (<this>this).readFunc(<I>(<StateLike<I>>(<this>this)._state).get);
            }
        }
        return undefined;
    }

    /**This sets the value of the proxied value*/
    set set(val: T) {
        if (this._state && this.writeFunc) {
            this._state.set = this.writeFunc(val);
        }
    }

    /**This sets the value of the proxied value*/
    set setSilent(val: T) {
        if (this._state && this.writeFunc) {
            this._state.setSilent = this.writeFunc(val);
        }
    }

    /**Adds compatability with promise */
    then(func: (val: T | undefined) => {}): void {
        let value = <Promise<T>>this.get;
        if (typeof value?.then === 'function') {
            value.then(func);
        } else {
            func(<T>value);
        }
    }

    /** This method compares any value the states value, returns true if they are different*/
    compare(val: any): boolean | Promise<boolean> {
        let value = <Promise<T>>this.get;
        if (typeof value?.then === 'function') {
            return value.then((value) => { return val !== value });
        } else {
            return val !== value;
        }
    }

    /**Returns state value to json stringifier, since it is not async if the state value is async it can only return undefined*/
    toJSON(): T | undefined {
        let value = <Promise<T>>this.get;
        if (typeof value?.then === 'function') {
            return undefined;
        } else {
            return <T>value;
        }
    }
}