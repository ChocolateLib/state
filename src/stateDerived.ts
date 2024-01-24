import { StateSubscriber, StateRead, StateResult } from "./types";
import { StateBase } from "./stateBase";
import { Err } from "@chocolatelib/result";

type StateDerivedGetter<I, O = I> = (value: StateResult<I>[]) => StateResult<O>;

/**The `StateDerived` class is used to create a state which is derived from other states. The derived state will update when any of the other states update.*/
export class StateDerived<I, O = I> extends StateBase<O> {
  /**Creates a state which is derived from other states. The derived state will update when any of the other states update.
   * @param state - The first state to be used in the derived state. If this is a function, it will be used as the getter function.
   * @param states - The other states to be used in the derived state.*/
  constructor(
    state?: StateRead<I> | StateDerivedGetter<I, O>,
    ...states: StateRead<I>[]
  ) {
    super();
    if (typeof state === "function") {
      this.getter = state;
      this.#states = states;
    } else this.#states = arguments as any;
  }

  #valid: boolean = false;
  #buffer: StateResult<O> | undefined;

  #states: StateRead<I>[];
  #stateBuffers: StateResult<I>[] = [];
  #stateSubscribers: StateSubscriber<I>[] = [];
  #calculatingValue: number = 0;

  protected getter(values: StateResult<I>[]): StateResult<O> {
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
        this.#buffer = this.getter([value]);
        this.updateSubscribers(this.#buffer);
      }, true);
  }

  #disconnect() {
    this.#valid = false;
    for (let i = 0; i < this.#states.length; i++)
      this.#states[i].unsubscribe(this.#stateSubscribers[i]);
    this.#stateSubscribers = [];
    this.#stateBuffers = [];
  }

  //Read
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
  setStates(...states: StateRead<I>[]) {
    if (this.subscribers.length) {
      this.#disconnect();
      this.#states = [...states];
      this.#connect();
    } else this.#states = [...states];
  }

  /**The `setGetter` method is used to update the getter function used by the `StateDerived` class.
   * This function is used to compute the derived state based on the current states.
   * @param getter - The new getter function. This function should accept an array of states and return the derived state.*/
  setGetter(getter: StateDerivedGetter<I, O>) {
    if (this.subscribers.length) {
      this.#disconnect();
      this.getter = getter;
      this.#connect();
    } else this.getter = getter;
  }
}
