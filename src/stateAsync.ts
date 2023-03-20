import { StateBase } from "./stateBase";
import { StateWrite, StateChecker, StateLimiter, StateSubscriber, StateAsync, StateAsyncRead, StateAsyncWrite, StateOwner } from "./types";

export class StateAsyncClass<R, W extends R> extends StateBase<R> implements StateAsync<R, W> {
    constructor(once: StateAsyncRead<R>, setup: StateAsyncRead<R>, teardown: StateAsyncRead<R>) {
        super();
        this._once = once;
        this._setup = setup;
        this._teardown = teardown;
    }

    _isLive: boolean = false;
    _valid: boolean = false;
    _buffer: R | undefined;

    _once: StateAsyncRead<R>;
    _setup: StateAsyncRead<R>;
    _teardown: StateAsyncRead<R>;
    _waiting: boolean = false;
    _fulfillment: ((value: R | PromiseLike<R>) => void)[] = [];
    _rejections: ((reason?: any) => void)[] = [];

    _setter: StateAsyncWrite<R, W> | undefined;
    _check: StateChecker<W> | undefined;
    _limit: StateLimiter<W> | undefined;

    //Read
    subscribe<B extends StateSubscriber<R>>(func: B, update: boolean): B {
        if (this._subscribers.length === 0) {
            this._isLive = true;
            this._subscribers.push(func);
            this._setup(this)
            return func;
        }
        return super.subscribe(func, update);
    }
    unsubscribe<B extends StateSubscriber<R>>(func: B): B {
        if (this._subscribers.length === 1) {
            this._isLive = false;
            this._valid = false;
            this._teardown(this);
        }
        return super.unsubscribe(func);
    }
    async then<TResult1 = R, TResult2 = never>(onfulfilled: ((value: R) => TResult1 | PromiseLike<TResult1>), onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>)): Promise<TResult1 | TResult2> {
        if (this._valid) {
            return await onfulfilled(<R>this._buffer);
        } else {
            try {
                let value = await new Promise<R>((a, b) => {
                    this._fulfillment.push(a);
                    this._rejections.push(b);
                    this._waiting = true;
                    if (!this._isLive) {
                        this._once(this);
                    }
                });
                return onfulfilled(value);
            } catch (error) {
                if (onrejected) {
                    return onrejected(error);
                }
                throw error;
            }
        }
    }
    //Write
    write(value: W): void {
        if (this._setter && this._buffer !== value) {
            this._setter(value, this);
        }
    }
    check(value: W): string | undefined {
        return (this._check ? this._check(value) : undefined)
    }
    limit(value: W): W {
        return (this._limit ? this._limit(value) : value);
    }

    //Owner
    set(value: R) {
        this._buffer = value;
        this._updateSubscribers(value);
    }
    inUse(): boolean {
        return Boolean(this._subscribers.length);
    }
    hasSubscriber(subscriber: StateSubscriber<R>): boolean {
        return this._subscribers.includes(subscriber);
    }

    //Async
    setLiveValue(value: R, invalidReason?: any) {
        this._valid = !Boolean(invalidReason);
        this._buffer = value;
        this._updateSubscribers(value);
        if (this._waiting) {
            if (invalidReason) {
                this.setRejection(invalidReason)
            } else {
                this.setFulfillment(value);
            }
        }
    }
    setFulfillment(value: R) {
        for (let i = 0; i < this._fulfillment.length; i++) {
            this._fulfillment[i](value);
        }
        this._rejections = [];
        this._waiting = false;
    }
    setRejection(reason: any) {
        for (let i = 0; i < this._rejections.length; i++) {
            this._rejections[i](reason);
        }
        this._fulfillment = [];
        this._waiting = false;
    }
}

/**Creates a state which connects to an async source and keeps updated with any changes to the source
 * @param init initial value for state, use undefined to indicate that state does not have a value yet
 * @param once function called when state value is requested once, the function should throw if it fails to get data
 * @param setup function called when state is being used to setup live update of value
 * @param teardown function called when state is no longer being used to teardown/cleanup communication
 * @param setter function called when state value is set via setter, set true let state set it's own value 
 * @param checker function to allow state users to check if a given value is valid for the state
 * @param limiter function to allow state users to limit a given value to state limit */
export const createStateAsync = <R, W extends R = R>(once: StateAsyncRead<R>, setup: StateAsyncRead<R>, teardown: StateAsyncRead<R>, setter?: StateAsyncWrite<R, W>, checker?: StateChecker<W>, limiter?: StateLimiter<W>) => {
    let state = new StateAsyncClass<R, W>(once, setup, teardown);
    if (setter) {
        state._setter = setter;
    }
    if (checker) {
        state._check = checker;
    }
    if (limiter) {
        state._limit = limiter;
    }
    return state as StateOwner<R, W>;
}