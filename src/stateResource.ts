import { Result } from "@chocolatelib/result";
import { StateBase } from "./stateBase";
import { StateError, StateInfo, StateSubscriber, StateWrite } from "./types";

export abstract class StateResource<R, W extends R = R> extends StateBase<R> implements StateWrite<R, W>, StateInfo<R> {
    /**Stores the last time when buffer was valid*/
    private _valid: number = 0;
    /**Buffer of last value*/
    private _buffer: Result<R, StateError> | undefined;

    /**Timeout for validity of last buffered value*/
    get timeout(): number {
        return 50;
    }

    /**Debounce delaying one time value retrival */
    get debounce(): number {
        return 50;
    }

    private async _singleGet(): Promise<Result<R, StateError>> {
        if (this.debounce > 0)
            await new Promise((a) => { setTimeout(a, this.debounce) });
        let value = await this.singleGet(this);
        if (value.ok)
            this._valid = Date.now() + this.timeout;
        return value;
    }

    /**Called if the state is awaited, call singleGetReturn with the result*/
    protected abstract singleGet(self: this): Promise<Result<R, StateError>>


    /**Called when state is subscribed to to setup connection to remote resource*/
    protected setupConnection(self: this) {

    }

    /**Called when state is no longer subscribed to to cleanup connection to remote resource*/
    protected teardownConnection(self: this) {

    }


    subscribe<B extends StateSubscriber<R>>(func: B, update?: boolean): B {
        if (this._subscribers.length === 0) {
            this._isLive = true;
            this._subscribers.push(func);
            this.setupConnection(this)
            return func;
        }
        return super.subscribe(func, update);
    }

    unsubscribe<B extends StateSubscriber<R>>(func: B): B {
        if (this._subscribers.length === 1) {
            this._isLive = false;
            this._valid = false;
            this.teardownConnection(this);
        }
        return super.unsubscribe(func);
    }

    async then<TResult1 = R>(func: ((value: Result<R, StateError>) => TResult1 | PromiseLike<TResult1>)): Promise<TResult1> {
        if (this._valid >= Date.now()) {
            return func(this._buffer!);
        } else {
            return func(await this._singleGet())
        }
    }




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
}