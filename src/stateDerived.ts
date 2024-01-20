import { StateSubscriber, StateRead, StateResult } from "./types";
import { StateBase } from "./stateBase";
import { Err, Ok } from "@chocolatelib/result";

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
      });
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

/** The `StateAverage` class is a specialized type of `StateDerived` that represents the average of multiple `State` instances.
 * It takes multiple `State` instances as input and automatically updates its value whenever any of the input states change.
 * The value of a `StateAverage` instance is the average of the values of the input states.*/
export class StateAverage extends StateDerived<number, number> {
  protected getter(values: Array<StateResult<number>>): StateResult<number> {
    let sum = 0;
    for (let i = 0; i < values.length; i++) {
      let value = values[i];
      if (value.ok) sum += value.value;
      else return value;
    }
    return Ok(sum / values.length);
  }
}

/** The `StateSummer` class is a specialized type of `StateDerived` that represents the sum of multiple `State` instances.
 * It takes multiple `State` instances as input and automatically updates its value whenever any of the input states change.
 * The value of a `StateSummer` instance is the sum of the values of the input states.*/
export class StateSummer extends StateDerived<number, number> {
  protected getter(values: Array<StateResult<number>>): StateResult<number> {
    let sum = 0;
    for (let i = 0; i < values.length; i++) {
      let value = values[i];
      if (value.ok) sum += value.value;
      else return value;
    }
    return Ok(sum);
  }
}

/** The `StateConcat` class is a specialized type of `StateDerived` that represents the concatenation of multiple `State` instances.
 * It takes multiple `State` instances as input and automatically updates its value whenever any of the input states change.
 * The value of a `StateConcat` instance is the concatenation of the values of the input states.*/
export class StateConcat extends StateDerived<
  string | number | boolean,
  string
> {
  protected getter(
    values: Array<StateResult<string | number | boolean>>
  ): StateResult<string> {
    let sum = "";
    for (let i = 0; i < values.length; i++) {
      let value = values[i];
      if (value.ok) sum += value.value;
      else return value;
    }
    return Ok(sum);
  }
}
