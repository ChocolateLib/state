import { StateSubscriber, State, StateInfo } from "./state";

export interface StateRepeaterOptions {
    info?: StateInfo
}

/**State repeater
 * @param T type of repeater value 
 * @param I type of repeated state value*/
export class StateRepeater<T, I> extends State<T | undefined> {
    private _state: State<I> | undefined;
    private _subscriber: StateSubscriber<I> | undefined;

    /**State repeater
     * @param state state to repeat value from
     * @param readFunc mapper function to change original value for users of the proxy
     * @param writeFunc mapper function to change values set on the proxy before relaying them to the original*/
    constructor(state?: State<I>, readFunc: (val: I) => T = (val: I) => { return <T><any>val; }, writeFunc?: (val: T) => I, options?: StateRepeaterOptions) {
        super(undefined);
        this._state = state;
        this.readFunc = readFunc;
        this.writeFunc = writeFunc;
        //@ts-expect-error
        this.readonly = !Boolean(writeFunc);
        if (options) {
            this.options = options;
        }
    }

    /**Function used to transform value read from repeated state*/
    readonly readFunc: (val: I) => T;

    /**Function used to transform value written to repeated state*/
    readonly writeFunc: ((val: T) => I) | undefined;

    /**Changes the state being repeated*/
    set state(state: State<I> | undefined) {
        if (this._state) {
            if (this._subscriber) {
                this._state.unsubscribe(this._subscriber);
            }
            this._subscriber = undefined;
            if (!state) {
                this._state = undefined;
                super.set = undefined;
            }
        }
        if (state) {
            if (this._subscribers.length) {
                this._subscriber = state.subscribe((value) => { super.set = this.readFunc(value); }, true);
            }
            this._state = state;
        }
    }

    /**Returns the repeated state*/
    get state(): State<I> | undefined { return this._state; }

    /**     __      __   _            
     *     \ \    / /  | |           
     *      \ \  / /_ _| |_   _  ___ 
     *       \ \/ / _` | | | | |/ _ \
     *        \  / (_| | | |_| |  __/
     *         \/ \__,_|_|\__,_|\___| */

    /**Adds compatability with promise */
    then<TResult1 = T | undefined, TResult2 = never>(onfulfilled: ((value: T | undefined) => TResult1 | PromiseLike<TResult1>), onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>)): PromiseLike<TResult1 | TResult2> {
        if (this._state) {
            return this._state.then((val) => {

                onfulfilled(this.readFunc(val))
            });
        }
        return new Promise((a) => { a(onfulfilled(undefined)) });
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

    /**This adds a function as a subscriber to the state
     * @param update set true to update subscriber*/
    subscribe<B = T>(func: StateSubscriber<B>, update?: boolean): typeof func {
        if (this._state && !this._subscriber) {
            this._subscriber = this._state.subscribe((value) => { super.set = this.readFunc(value); }, update);
        }
        return super.subscribe(func, update);
    }

    /**This removes a function as a subscriber to the state*/
    unsubscribe<B = T>(func: StateSubscriber<B>): typeof func {
        if (this._subscribers.length === 1 && this._subscriber && this._state) {
            this._state.unsubscribe(this._subscriber);
            this._subscriber = undefined;
        }
        return super.unsubscribe(func);
    }

    /**Options of state */
    set options(options: StateRepeaterOptions) {
        if (options.info) {
            //@ts-expect-error
            this.info = options.info;
        }
        this._updateOptions();
    }
}