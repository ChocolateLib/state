import { None, Option } from "@chocolatelib/result";
import {
  StateReadAsync,
  StateRelated,
  StateResult,
  StateSubscriber,
} from "./types";

export abstract class StateBase<R, L extends StateRelated = {}>
  implements StateReadAsync<R, L>
{
  protected subscribers: StateSubscriber<R>[] = [];

  //Reader Context
  abstract then<TResult1 = R>(
    func: (value: StateResult<R>) => TResult1 | PromiseLike<TResult1>
  ): PromiseLike<TResult1>;

  subscribe<B extends StateSubscriber<R>>(func: B, update?: boolean): B {
    if (this.subscribers.includes(func)) {
      console.warn("Function already registered as subscriber");
      return func;
    }
    this.onSubscribe(this.subscribers.length == 0);
    this.subscribers.push(func);
    if (update)
      this.then((value) => {
        func(value);
      });
    return func;
  }

  unsubscribe<B extends StateSubscriber<R>>(func: B): B {
    const index = this.subscribers.indexOf(func);
    if (index != -1) {
      this.onUnsubscribe(this.subscribers.length == 1);
      this.subscribers.splice(index, 1);
    } else console.warn("Subscriber not found with state", this, func);
    return func;
  }

  related(): Option<L> {
    return None();
  }

  //Owner Context
  /**Called when subscriber is added*/
  protected onSubscribe(_first: boolean) {}
  /**Called when subscriber is removed*/
  protected onUnsubscribe(_last: boolean) {}

  /**Returns if the state is being used */
  inUse(): boolean {
    return Boolean(this.subscribers.length);
  }

  /**Returns if the state has a subscriber */
  hasSubscriber(subscriber: StateSubscriber<R>): boolean {
    return this.subscribers.includes(subscriber);
  }

  /**Updates all subscribers with a value */
  protected updateSubscribers(value: StateResult<R>): void {
    for (let i = 0, m = this.subscribers.length; i < m; i++) {
      try {
        this.subscribers[i](value);
      } catch (e) {
        console.warn(
          "Failed while calling subscribers ",
          e,
          this,
          this.subscribers[i]
        );
      }
    }
  }
}

/**Checks if a variable is an instance of a state*/
export const instanceOfState = (state: any) => {
  return state instanceof StateBase;
};
