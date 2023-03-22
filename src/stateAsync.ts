import { StateBase } from "./stateBase";
import { StateChecker, StateInfo, StateLimiter, StateSubscriber, StateWrite } from "./types";

/**Function used to retrieve value from async source once*/
type StateAsyncRead<R, W extends R = R> = (state: StateAsync<R, W>) => void

/**Function used when user writes to async source*/
type StateAsyncWrite<R, W extends R = R> = (value: W, state: StateAsync<R, W>) => void

export class StateAsync<R, W extends R = R> extends StateBase<R> implements StateWrite<R, W>, StateInfo<R> {
    /**Creates a state which connects to an async source and keeps updated with any changes to the source
     * @param init initial value for state, use undefined to indicate that state does not have a value yet
     * @param once function called when state value is requested once, the function should throw if it fails to get data
     * @param setup function called when state is being used to setup live update of value
     * @param teardown function called when state is no longer being used to teardown/cleanup communication
     * @param setter function called when state value is set via setter, set true let state set it's own value 
     * @param checker function to allow state users to check if a given value is valid for the state
     * @param limiter function to allow state users to limit a given value to state limit */
    constructor(once: StateAsyncRead<R, W>, setup: StateAsyncRead<R, W>, teardown: StateAsyncRead<R, W>, setter?: StateAsyncWrite<R, W>, checker?: StateChecker<W>, limiter?: StateLimiter<W>) {
        super();
        if (setter)
            this._setter = setter;
        if (checker)
            this._check = checker;
        if (limiter)
            this._limit = limiter;
        this._once = once;
        this._setup = setup;
        this._teardown = teardown;
    }

    private _isLive: boolean = false;
    private _valid: boolean = false;
    private _buffer: R | undefined;

    private _once: StateAsyncRead<R, W>;
    private _setup: StateAsyncRead<R, W>;
    private _teardown: StateAsyncRead<R, W>;
    private _waiting: boolean = false;
    private _fulfillment: ((value: R | PromiseLike<R>) => void)[] = [];
    private _rejections: ((reason?: any) => void)[] = [];

    private _setter: StateAsyncWrite<R, W> | undefined;
    private _check: StateChecker<W> | undefined;
    private _limit: StateLimiter<W> | undefined;

    //Read
    subscribe<B extends StateSubscriber<R>>(func: B, update?: boolean): B {
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
                if (onrejected)
                    return onrejected(error);
                throw error;
            }
        }
    }
    //Write
    write(value: W): void {
        if (this._setter && this._buffer !== value)
            this._setter(value, this);
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
        this._rejections = [];
        for (let i = 0; i < this._fulfillment.length; i++)
            this._fulfillment[i](value);
        this._waiting = false;
    }
    setRejection(reason: any) {
        this._fulfillment = [];
        for (let i = 0; i < this._rejections.length; i++)
            this._rejections[i](reason);
        this._waiting = false;
    }
}