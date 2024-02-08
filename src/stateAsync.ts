import { None, Ok, Option, Some } from "@chocolatelib/result";
import { StateBase } from "./stateBase";
import { StateHelper, StateResult, StateWriteAsync } from "./types";

export class StateAsync<R, W = R, L extends {} = {}, A = W>
  extends StateBase<R, L>
  implements StateWriteAsync<R, W, L>
{
  /**Creates a state which holds a value, this one can be instantiated with an async value
   * @param init initial value for state, use a promise for an eager async value, use a function returning a promise for a lazy async value
   * @param setter function called when state value is set via setter, set true let write set it's value
   * @param limiter functions to check and limit
   * @param related function returning the related states to this one*/
  constructor(
    init:
      | StateResult<Exclude<R, Function>>
      | Promise<StateResult<Exclude<R, Function>>>
      | (() => Promise<StateResult<Exclude<R, Function>>>),
    setter?: ((value: W) => Option<StateResult<R>>) | true,
    helper?: StateHelper<A, L>
  ) {
    super();
    if (setter)
      this.#setter =
        setter === true
          ? (value) =>
              this.#helper?.limit
                ? this.#helper
                    .limit(value as any)
                    .map<StateResult<R>>((val) => Ok(val as any))
                : Some(Ok(value as any))
          : setter;
    if (helper) this.#helper = helper;
    if (init instanceof Promise) {
      this.then = init.then.bind(init);
      init.then((value) => {
        this.#value = value;
        //@ts-expect-error
        delete this.then;
        //@ts-expect-error
        delete this.write;
      });
      this.write = (value) => {
        init.then(() => {
          //@ts-expect-error
          delete this.write;
          this.write(value);
        });
      };
    } else if (typeof init === "function") {
      let writePromise = new Promise<void>((a) => {
        this.then = (func) => {
          let promise = init();
          this.then = promise.then.bind(promise);
          promise.then((value) => {
            this.#value = value;
            //@ts-expect-error
            delete this.then;
            //@ts-expect-error
            delete this.write;
            a();
          });
          return promise.then(func);
        };
      });
      this.write = (value) => {
        writePromise.then(() => {
          //@ts-expect-error
          delete this.write;
          this.write(value);
        });
      };
    } else {
      this.#value = init;
    }
  }

  #value?: StateResult<R>;
  #setter?: (value: W) => Option<StateResult<R>>;
  #helper?: StateHelper<A, L>;

  //Reader Context
  async then<TResult1 = R>(
    func: (value: StateResult<R>) => TResult1 | PromiseLike<TResult1>
  ): Promise<TResult1> {
    return func(this.#value!);
  }

  related(): Option<L> {
    return this.#helper?.related ? this.#helper.related() : None();
  }

  //Writer Context
  /**Requests a change of value from the state */
  write(value: W): void {
    if (this.#setter && this.#value!.ok && (this.#value as any).value !== value)
      this.#setter(value).map(this.set.bind(this));
  }

  /**Checks the value against the limit set by the limiter, if no limiter is set, undefined is returned*/
  check(value: W): Option<string> {
    return this.#helper?.check ? this.#helper.check(value as any) : None();
  }

  /**Limits the value to the limit set by the limiter, if no limiter is set, the value is returned as is*/
  limit(value: W): Option<W> {
    return this.#helper?.limit
      ? (this.#helper.limit(value as any) as any)
      : Some(value);
  }

  //Owner Context
  /**Sets the value of the state */
  set(value: StateResult<R>) {
    this.#value = value;
    this.updateSubscribers(value);
  }

  /**Gets the value of the state */
  get(): StateResult<R> {
    return this.#value!;
  }
}
