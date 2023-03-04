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

/**State container class to keep track of state values
 * undefined is used when the value of the state is invalid*/
export class State<T> {
    protected _subscribers: StateSubscriber<T>[] = [];
    protected _optionSubscribers: StateOptionsSubscriber<this>[] | undefined;
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

    /**     __      __   _            
     *     \ \    / /  | |           
     *      \ \  / /_ _| |_   _  ___ 
     *       \ \/ / _` | | | | |/ _ \
     *        \  / (_| | | |_| |  __/
     *         \/ \__,_|_|\__,_|\___| */

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

    /**Adds compatability with promise */
    then<TResult1 = T, TResult2 = never>(onfulfilled: ((value: T) => TResult1 | PromiseLike<TResult1>), onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>)): PromiseLike<TResult1 | TResult2> {
        onrejected;
        return new Promise((a) => { a(onfulfilled(this._value)) });
    }

    /**This adds a function as a subscriber to the state
     * @param update set true to update subscriber*/
    subscribe(func: StateSubscriber<T>, update?: boolean): typeof func {
        this._subscribers.push(func);
        if (update) {
            this.then(<any>func);
        }
        return func;
    }

    /**This removes a function as a subscriber to the state*/
    unsubscribe(func: StateSubscriber<T>): typeof func {
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
    subscribeOptions(func: StateOptionsSubscriber<this>, update?: boolean): typeof func {
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
    unsubscribeOptions(func: StateOptionsSubscriber<this>): typeof func {
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

export interface StateLike<T> {
    subscribe(func: StateSubscriber<T>, update?: boolean): StateSubscriber<any>
    unsubscribe(func: StateSubscriber<T>): StateSubscriber<any>
    subscribeOptions(func: StateOptionsSubscriber<this>, update?: boolean): StateOptionsSubscriber<any>
    unsubscribeOptions(func: StateOptionsSubscriber<this>): StateOptionsSubscriber<any>
}
