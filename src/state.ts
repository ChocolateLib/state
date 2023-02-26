/**Function to listen for state changes */
export type StateSubscriber<T> = (val: T) => void

/**Metadata for state */
export type StateInfo = {
    /**Short description of state function */
    name: string,
    /**Long description of state function */
    description?: string
};

/**Use this type when you want to have an argument state with multiple types, this example will only work with the StateLike
 * let func = (state:StateLike<number|string>)=>{return state}
 * let state = new State<number>(1);
 * func(state) */
export interface StateLike<T> {
    /**Metadata about state*/
    readonly info: StateInfo | undefined
    /**Returns if the state is read only*/
    get readonly(): boolean
    /**Returns if the state is async and will return an async value*/
    get async(): boolean
    /**This adds a function as a subscriber to the state
     * @param update set true to update subscriber*/
    subscribe(func: StateSubscriber<any>, update?: boolean): typeof func
    /**This removes a function as a subscriber to the state*/
    unsubscribe(func: StateSubscriber<any>): typeof func
    /** This gets the current value of the state*/
    get get(): T | Promise<T>
    /** This sets the value of the state and updates all subscribers*/
    set set(val: T)
    /** This sets the value of the state*/
    set setSilent(val: T)
    /** This calls all subscribers with the given value*/
    update(val: T): void
    /** This sends an update without changing the value, can be used for more complex values*/
    updateSkip(val: T, subscriber: StateSubscriber<T>): void
    /** Returns wether the state has subscribers, true means it has at least one subscriber*/
    get inUse(): boolean
    /** Returns wether the state has a specific subscribers, true means it has that subscribers*/
    hasSubscriber(func: StateSubscriber<T>): boolean
    /**Adds compatability with promise */
    then(func: (val: T) => {}): void
    /** This method compares any value the states value, returns true if they are different*/
    compare(val: any): boolean | Promise<boolean>
}

/**State container class to keep track of state values*/
export class State<T> implements StateLike<T> {
    protected _subscribers: StateSubscriber<T>[] = [];
    protected _value: T;

    /**State container
     * @param init initial value of the state*/
    constructor(init: T, info?: StateInfo) {
        this._value = init;
        this.info = info;
    }

    /**Metadata about state*/
    readonly info: StateInfo | undefined

    /**Returns if the state is read only*/
    get readonly(): boolean { return false; }

    /**Returns if the state is async and will return an async value*/
    get async(): boolean { return false; }

    /**This adds a function as a subscriber to the state
     * @param update set true to update subscriber*/
    subscribe(func: StateSubscriber<T>, update?: boolean): typeof func {
        this._subscribers.push(func);
        if (update) {
            func(this._value);
        }
        return func;
    }

    /**This removes a function as a subscriber to the state*/
    unsubscribe(func: StateSubscriber<T>): typeof func {
        let index = this._subscribers.indexOf(func);
        if (index != -1) {
            this._subscribers.splice(index, 1);
        }
        return func;
    }

    /** This gets the current value of the state*/
    get get(): T | Promise<T> {
        return this._value;
    }

    /** This sets the value of the state and updates all subscribers*/
    set set(val: T) {
        if (this._value !== val) {
            this._value = val;
            this.update(val);
        }
    }

    /** This sets the value of the state*/
    set setSilent(val: T) {
        this._value = val;
    }

    /** This calls all subscribers with the given value*/
    update(val: T): void {
        for (let i = 0, m = this._subscribers.length; i < m; i++) {
            try {
                this._subscribers[i](val);
            } catch (e) {
                console.warn('Failed while calling subscribers ', e);
            }
        }
    }

    /** This calls all subscribers with the given value, but skips given subscribers*/
    updateSkip(val: T, ...subscribers: StateSubscriber<T>[]): void {
        for (let i = 0, m = this._subscribers.length; i < m; i++) {
            if (!subscribers.includes(this._subscribers[i])) {
                try {
                    this._subscribers[i](val);
                } catch (e) {
                    console.warn('Failed while calling subscribers ', e);
                }
            }
        }
    }

    /** Returns wether the state has subscribers, true means it has at least one subscriber*/
    get inUse(): boolean {
        return this._subscribers.length !== 0;
    }

    /** Returns wether the state has a specific subscribers, true means it has that subscribers*/
    hasSubscriber(func: StateSubscriber<T>): boolean {
        return this._subscribers.indexOf(func) !== -1;
    }

    /**Adds compatability with promise */
    then(func: (val: T) => {}): void {
        func(this._value);
    }

    /** This method compares any value the states value, returns true if they are different*/
    compare(val: any): boolean | Promise<boolean> {
        return val !== this._value;
    }

    /**Returns state value to json stringifier, since it is not async if the state value is async it can only return undefined*/
    toJSON(): T | undefined {
        return this._value;
    }
}