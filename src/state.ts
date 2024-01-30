import { None, Ok, Option, Some } from "@chocolatelib/result";
import { StateBase } from "./stateBase";
import { StateLimiter, StateRelated, StateResult, StateWrite } from "./types";

export class State<R, W = R, L extends {} = any>
  extends StateBase<R, L>
  implements StateWrite<R, W, L>
{
  /**Creates a state which holds a value
   * @param init initial value for state, use a promise for an eager async value, use a function returning a promise for a lazy async value
   * @param setter function called when state value is set via setter, set true let write set it's value
   * @param limiter functions to check and limit
   * @param related function returning the related states to this one*/
  constructor(
    init:
      | StateResult<R>
      | Promise<StateResult<R>>
      | (() => Promise<StateResult<R>>),
    setter?: ((value: W) => Option<StateResult<R>>) | true,
    limiter?: StateLimiter<W>,
    related?: () => Option<StateRelated<L>>
  ) {
    super();
    if (setter)
      this.#setter =
        setter === true
          ? (value) =>
              this.#limit
                ? this.#limit
                    .limit(value as any)
                    .map<StateResult<R>>((val) => Ok(val as any))
                : Some(Ok(value as any))
          : setter;
    if (limiter) this.#limit = limiter;
    if (related) this.#related = related;
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

  #value: StateResult<R> | undefined;
  #setter: ((value: W) => Option<StateResult<R>>) | undefined;
  #limit: StateLimiter<W> | undefined;
  #related: (() => Option<StateRelated<L>>) | undefined;

  //Reader Context
  async then<TResult1 = R>(
    func: (value: StateResult<R>) => TResult1 | PromiseLike<TResult1>
  ): Promise<TResult1> {
    return func(this.#value!);
  }

  related(): Option<StateRelated<L>> {
    return this.#related ? this.#related() : None();
  }

  //Writer Context
  /**Requests a change of value from the state */
  write(value: W): void {
    if (this.#setter && this.#value!.ok && (this.#value as any).value !== value)
      this.#setter(value).map(this.set.bind(this));
  }

  /**Checks the value against the limit set by the limiter, if no limiter is set, undefined is returned*/
  check(value: W): string | undefined {
    return this.#limit ? this.#limit.check(value) : undefined;
  }

  /**Limits the value to the limit set by the limiter, if no limiter is set, the value is returned as is*/
  limit(value: W): Option<W> {
    return this.#limit ? this.#limit.limit(value) : Some(value);
  }

  //Owner Context
  /**Sets the value of the state */
  set(value: StateResult<R>) {
    this.#value = value;
    this.updateSubscribers(value);
  }
}
