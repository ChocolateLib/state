export type StateSubscriber<T> = (val: T) => void

export type StateOptionsSubscriber<T> = (val: T) => void

export type StateInfo = {
    name: string,
    description?: string
    icon?: () => SVGSVGElement
};

export interface StateOptions {
    info?: StateInfo
    readonly?: boolean
}

/**State container class to keep track of state values*/
export class State<T> {
    protected _subscribers: StateSubscriber<any>[] = [];
    protected _optionSubscribers: StateOptionsSubscriber<any>[] | undefined;
    protected _value: T;

    /**State container class to keep track of state values*/
    constructor(init: T, options?: StateOptions) {
        this._value = init;
        if (options) {
            this.options = options;
        }
    }

    /**Info about state*/
    readonly info: StateInfo | undefined;

    /**Returns if the state is read only*/
    readonly readonly: boolean = false;

    /**Returns state value to json stringifier, since it is not async if the state value is async it can only return undefined*/
    toJSON(): T | undefined {
        const value = <Promise<T>>this.get;
        if (typeof value?.then === 'function') {
            return undefined;
        } else {
            return <T>value;
        }
    }

    /**     __      __   _            
     *     \ \    / /  | |           
     *      \ \  / /_ _| |_   _  ___ 
     *       \ \/ / _` | | | | |/ _ \
     *        \  / (_| | | |_| |  __/
     *         \/ \__,_|_|\__,_|\___| */

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

    /**This adds a function as a subscriber to the state
     * @param update set true to update subscriber*/
    subscribe<B = T>(func: StateSubscriber<B>, update?: boolean): typeof func {
        this._subscribers.push(func);
        if (update) {
            this.then(<any>func);
        }
        return func;
    }

    /**This removes a function as a subscriber to the state*/
    unsubscribe<B = T>(func: StateSubscriber<B>): typeof func {
        const index = this._subscribers.indexOf(func);
        if (index != -1) {
            this._subscribers.splice(index, 1);
        } else {
            console.warn('Subscriber not found with state');
        }
        return func;
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

    /**Adds compatability with promise */
    then(func: StateSubscriber<T>): void {
        const value = <Promise<T>>this.get;
        if (typeof value?.then === 'function') {
            value.then(func);
        } else {
            func(<T>value);
        }
    }

    /** This method compares any value the states value, returns true if they are different*/
    compare(val: any): boolean | Promise<boolean> {
        const value = <Promise<T>>this.get;
        if (typeof value?.then === 'function') {
            return value.then((value) => { return val !== value });
        } else {
            return val !== value;
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

    /*       ____        _   _                 
     *      / __ \      | | (_)                
     *     | |  | |_ __ | |_ _  ___  _ __  ___ 
     *     | |  | | '_ \| __| |/ _ \| '_ \/ __|
     *     | |__| | |_) | |_| | (_) | | | \__ \
     *      \____/| .__/ \__|_|\___/|_| |_|___/
     *            | |                          
     *            |_|                          */

    /**Options of state */
    set options(options: StateOptions) {
        if (options.info) {
            //@ts-expect-error
            this.info = options.info;
        }
        if (options.readonly) {
            //@ts-expect-error
            this.readonly = options.readonly;
        }
        this._updateOptions();
    }

    /**This adds a function as a subscriber to the states options
     * @param update set true to update subscriber*/
    subscribeOptions<B = T>(func: StateOptionsSubscriber<State<B>>, update?: boolean): typeof func {
        if (!this._optionSubscribers) {
            this._optionSubscribers = [];
        }
        this._optionSubscribers.push(func);
        if (update) {
            func(<any>this);
        }
        return func;
    }

    /**This removes a function as a subscriber to the state*/
    unsubscribeOptions<B = T>(func: StateOptionsSubscriber<State<B>>): typeof func {
        if (this._optionSubscribers) {
            const index = this._optionSubscribers.indexOf(func);
            if (index != -1) {
                this._optionSubscribers.splice(index, 1);
            } else {
                console.warn('Option subscriber not found with state');
            }
        }
        return func;
    }

    /**This calls all option subscribers*/
    protected _updateOptions(): void {
        if (this._optionSubscribers) {
            for (let i = 0, m = this._optionSubscribers.length; i < m; i++) {
                try {
                    this._optionSubscribers[i](this);
                } catch (e) {
                    console.warn('Failed while calling option subscribers ', e);
                }
            }
        }
    }

    /** This calls all option subscribers, but skips given subscribers*/
    protected _updateOptionsSkip(...subscribers: StateOptionsSubscriber<this>[]): void {
        if (this._optionSubscribers) {
            for (let i = 0, m = this._optionSubscribers.length; i < m; i++) {
                if (!subscribers.includes(this._optionSubscribers[i])) {
                    try {
                        this._optionSubscribers[i](this);
                    } catch (e) {
                        console.warn('Failed while calling option subscribers ', e);
                    }
                }
            }
        }
    }

    /** Returns wether the state has option subscribers, true means it has at least one subscriber*/
    get inUseOptions(): boolean {
        if (this._optionSubscribers) {
            return this._optionSubscribers.length !== 0;
        }
        return false;
    }

    /** Returns wether the state has a specific subscribers, true means it has that subscribers*/
    hasOptionsSubscriber(func: StateOptionsSubscriber<this>): boolean {
        if (this._optionSubscribers) {
            return this._optionSubscribers.indexOf(func) !== -1;
        }
        return false;
    }
}