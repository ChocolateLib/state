import { None, Option } from "@chocolatelib/result";
import { StateRead, StateRelated, StateResult, StateSubscriber } from "./types";

export abstract class StateBase<R, L extends {} = any> implements StateRead<R, L>{
    protected subscribers: StateSubscriber<R>[] = [];

    abstract then<TResult1 = R>(func: ((value: StateResult<R>) => TResult1 | PromiseLike<TResult1>)): PromiseLike<TResult1>

    subscribe<B extends StateSubscriber<R>>(func: B, update?: boolean): B {
        if (this.subscribers.includes(func)) {
            console.warn('Function already registered as subscriber');
            return func
        }
        this.subscribers.push(func);
        if (update) {
            this.then((value) => { func(value); });
        }
        return func;
    }

    unsubscribe<B extends StateSubscriber<R>>(func: B): B {
        const index = this.subscribers.indexOf(func);
        if (index != -1) {
            this.subscribers.splice(index, 1);
        } else {
            console.warn('Subscriber not found with state', this, func);
        }
        return func;
    }

    related(): Option<StateRelated<L>> {
        return None();
    }

    inUse(): boolean {
        return Boolean(this.subscribers.length);
    }

    hasSubscriber(subscriber: StateSubscriber<R>): boolean {
        return this.subscribers.includes(subscriber);
    }

    protected updateSubscribers(value: StateResult<R>): void {
        for (let i = 0, m = this.subscribers.length; i < m; i++) {
            try {
                this.subscribers[i](value);
            } catch (e) {
                console.warn('Failed while calling subscribers ', e, this, this.subscribers[i]);
            }
        }
    }
}

/**Checks if a variable is an instance of a state*/
export const instanceOfState = (state: any) => {
    return state instanceof StateBase;
}