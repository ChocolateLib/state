import { StateRead, StateSubscribe, StateSubscriber, StateWrite } from "./shared";

export abstract class StateBase<T> implements StateSubscribe<T>, StateRead<T>, StateWrite<T>{
    subscribers: StateSubscriber<T>[] = [];

    //Subscribe
    subscribe<B extends StateSubscriber<T>>(func: B): B {
        this.subscribers.push(func);
        return func;
    }

    unsubscribe<B extends StateSubscriber<T>>(func: B): B {
        const index = this.subscribers.indexOf(func);
        if (index != -1) {
            this.subscribers.splice(index, 1);
        } else {
            console.warn('Subscriber not found with state', this, func);
        }
        return func;
    }

    updateSubscribers(value: T): void {
        for (let i = 0, m = this.subscribers.length; i < m; i++) {
            try {
                this.subscribers[i](value);
            } catch (e) {
                console.warn('Failed while calling subscribers ', e, this, this.subscribers[i]);
            }
        }
    }

    abstract set(value: T): void

    abstract get(): T | PromiseLike<T>

    abstract then<TResult1 = T, TResult2 = never>(onfulfilled: ((value: T) => TResult1 | PromiseLike<TResult1>)): PromiseLike<TResult1 | TResult2>
}

/**Checks if a variable is an instance of a state*/
export const instanceOfState = (state: any) => {
    return state instanceof StateBase;
}