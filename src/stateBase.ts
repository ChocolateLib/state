import { StateSubscribe, StateSubscriber } from "./shared";

export abstract class StateBase<T> implements StateSubscribe<T>{
    _subscribers: StateSubscriber<T>[] = [];

    subscribe<B extends StateSubscriber<T>>(func: B): B {
        this._subscribers.push(func);
        return func;
    }

    unsubscribe<B extends StateSubscriber<T>>(func: B): B {
        const index = this._subscribers.indexOf(func);
        if (index != -1) {
            this._subscribers.splice(index, 1);
        } else {
            console.warn('Subscriber not found with state', this, func);
        }
        return func;
    }

    updateSubscribers(value: T): void {
        for (let i = 0, m = this._subscribers.length; i < m; i++) {
            try {
                this._subscribers[i](value);
            } catch (e) {
                console.warn('Failed while calling subscribers ', e, this, this._subscribers[i]);
            }
        }
    }

    abstract get(): PromiseLike<T>

    abstract then<TResult1 = T, TResult2 = never>(onfulfilled: ((value: T) => TResult1 | PromiseLike<TResult1>)): PromiseLike<TResult1 | TResult2>
}

/**Checks if a variable is an instance of a state*/
export const instanceOfState = (state: any) => {
    return state instanceof StateBase;
}