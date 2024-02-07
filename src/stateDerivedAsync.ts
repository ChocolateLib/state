import { StateSubscriber, StateResult, StateReadAsync } from "./types";
import { StateBase } from "./stateBase";
import { Err } from "@chocolatelib/result";

type StateReadArray<T extends any[]> = {
  [K in keyof T]: StateReadAsync<T[K]>;
};
type StateResultArray<T extends any[]> = {
  [K in keyof T]: StateResult<T[K]>;
};
type Tail<T extends any[]> = T extends [any, ...infer Rest] ? Rest : never;

/**The `StateDerivedAsync` class is used to create a state which is derived from other states. The derived state will update when any of the other states update.*/
export class StateDerivedAsync<I extends any[], O = I[0]>
  extends StateBase<O>
  implements StateReadAsync<O>
{
  /**Creates a state which is derived from other states. The derived state will update when any of the other states update.
   * @param state - The first state to be used in the derived state. If this is a function, it will be used as the getter function.
   * @param states - The other states to be used in the derived state.*/
  constructor(
    readTransform: (value: StateResultArray<I>) => StateResult<O>,
    ...states: StateReadArray<I>
  );
  constructor(...states: StateReadArray<I>);
  constructor(
    state?:
      | StateReadAsync<I[0]>
      | ((value: StateResultArray<I>) => StateResult<O>),
    ...states: Tail<StateReadArray<I>>
  ) {
    super();
    if (typeof state === "function") {
      this.getter = state;
      this.#states = states as any;
    } else this.#states = arguments as any;
  }

  #valid: boolean = false;
  #buffer: StateResult<O> | undefined;

  #states: StateReadArray<I>;
  #stateBuffers: StateResultArray<I> = [] as StateResultArray<I>;
  #stateSubscribers: StateSubscriber<I>[] = [];
  #calculatingValue: number = 0;

  protected getter(values: StateResultArray<I>): StateResult<O> {
    return values[0] as any;
  }

  async #calculate() {
    await undefined;
    this.#valid = true;
    this.#buffer = this.getter(this.#stateBuffers);
    this.updateSubscribers(this.#buffer);
    this.#calculatingValue = 1;
  }

  #connect() {
    this.#calculatingValue = 0;
    if (this.#states.length > 1) {
      let count = this.#states.length;
      for (let i = 0; i < this.#states.length; i++) {
        this.#stateSubscribers[i] = this.#states[i].subscribe((value) => {
          if (this.#calculatingValue === 1) {
            this.#stateBuffers[i] = value;
            this.#calculatingValue = 2;
            this.#calculate();
          } else if (this.#calculatingValue === 0 && !this.#stateBuffers[i]) {
            this.#stateBuffers[i] = value;
            count--;
            if (count === 0) {
              this.#calculatingValue = 2;
              this.#calculate();
            }
          } else this.#stateBuffers[i] = value;
        }, true);
      }
    } else
      this.#stateSubscribers[0] = this.#states[0].subscribe((value) => {
        this.#valid = true;
        this.#buffer = this.getter([value] as StateResultArray<I>);
        this.updateSubscribers(this.#buffer);
      }, true);
  }

  #disconnect() {
    this.#valid = false;
    for (let i = 0; i < this.#states.length; i++)
      this.#states[i].unsubscribe(this.#stateSubscribers[i]);
    this.#stateSubscribers = [];
    this.#stateBuffers = [] as StateResultArray<I>;
  }

  //Reader Context
  subscribe<B extends StateSubscriber<O>>(func: B, update?: boolean): B {
    if (this.subscribers.length === 0) {
      this.subscribers.push(func);
      this.#connect();
      return func;
    }
    return super.subscribe(func, update);
  }

  unsubscribe<B extends StateSubscriber<O>>(func: B): B {
    if (this.subscribers.length === 1) this.#disconnect();
    return super.unsubscribe(func);
  }

  async then<TResult1 = O>(
    func: (value: StateResult<O>) => TResult1 | PromiseLike<TResult1>
  ): Promise<TResult1> {
    if (this.#valid) return func(this.#buffer!);
    else if (this.#states.length)
      return func(this.getter(await Promise.all(this.#states)));
    else return func(Err({ reason: "No states registered", code: "INV" }));
  }

  //Owner

  /**The `setStates` method is used to update the states used by the `StateDerived` class.
   * @param states - The new states. This function should accept an array of states and return the derived state.*/
  setStates(...states: StateReadArray<I>) {
    if (this.subscribers.length) {
      this.#disconnect();
      this.#states = [...states] as StateReadArray<I>;
      this.#connect();
    } else this.#states = [...states] as StateReadArray<I>;
  }

  /**The `setGetter` method is used to update the getter function used by the `StateDerived` class.
   * This function is used to compute the derived state based on the current states.
   * @param getter - The new getter function. This function should accept an array of states and return the derived state.*/
  setGetter(getter: (value: StateResultArray<I>) => StateResult<O>) {
    if (this.subscribers.length) {
      this.#disconnect();
      this.getter = getter;
      this.#connect();
    } else this.getter = getter;
  }
}
