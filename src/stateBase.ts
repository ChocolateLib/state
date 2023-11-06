import { Result } from "@chocolatelib/result";
import { StateError, StateRead, StateSubscriber } from "./types";

export abstract class StateBase<R> implements StateRead<R>{
    protected _subscribers: StateSubscriber<R>[] = [];
    subscribe<B extends StateSubscriber<R>>(func: B, update?: boolean): B {
        this._subscribers.push(func);
        if (update) {
            try {
                this.then((value) => {
                    if (value.ok) {
                        func(value.value);
                    } else {
                        func(undefined as any, value.error);
                    }
                });
            } catch (error) {
                console.warn('Failed while calling update function', this, func);
            }
        }
        return func;
    }

    unsubscribe<B extends StateSubscriber<R>>(func: B): B {
        const index = this._subscribers.indexOf(func);
        if (index != -1) {
            this._subscribers.splice(index, 1);
        } else {
            console.warn('Subscriber not found with state', this, func);
        }
        return func;
    }

    inUse(): boolean {
        return Boolean(this._subscribers.length);
    }
    hasSubscriber(subscriber: StateSubscriber<R>): boolean {
        return this._subscribers.includes(subscriber);
    }

    protected _updateSubscribers(value: R, error?: StateError): void {
        for (let i = 0, m = this._subscribers.length; i < m; i++) {
            try {
                this._subscribers[i](value, error);
            } catch (e) {
                console.warn('Failed while calling subscribers ', e, this, this._subscribers[i]);
            }
        }
    }

    abstract then<TResult1 = R>(func: ((value: Result<R, StateError>) => TResult1 | PromiseLike<TResult1>)): PromiseLike<TResult1>
}

/**Checks if a variable is an instance of a state*/
export const instanceOfState = (state: any) => {
    return state instanceof StateBase;
}