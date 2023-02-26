import { State, StateLike, StateSubscriber } from "./state"

type StateObjectMembers = {
    [S: string]: StateLike<any>
}

/**Use this type when you want to have an argument StateObjectFixed with multiple types, this example will only work with the StateObjectLike*/
export interface StateObjectLike<T extends StateObjectMembers> extends StateLike<T | undefined> {
    /**Returns the Value of a key in the object */
    getKey(key: keyof T): T[keyof T]
    /**Sets the Value of a key in the object */
    setKey(key: keyof T, value: T[keyof T]): T[keyof T]
    /**This adds a function as an listener which is called at modifications to the object*/
    addSubValueListener(func: StateSubscriber<this>): typeof func
    /**This removes a function as an event listener from the value*/
    removeSubValueListener(func: StateSubscriber<this>): typeof func
    /** Returns wether the value has listeners, true means it has at least a listener*/
    get inUseSubValue(): boolean
    /** Returns wether the value has a specific listeners, true means it has that listener*/
    hasSubValueListener(func: StateSubscriber<this>): boolean
}

export class StateObjectFixed<T extends StateObjectMembers> extends State<T> {
    private ___subValueListeners: StateSubscriber<this>[] = [];
    private ___keylisteners: { [Property in keyof T]: StateSubscriber<any> } = <any>{}

    constructor(init: T) {
        super(init)
        for (const key in init) {
            this.___keylisteners[key] = init[key].subscribe(() => { this.___updateSubValue() });
        }
    }

    /**Returns the Value of a key in the object */
    getKey(key: keyof T): T[keyof T] {
        return this._value[key];
    }

    /**Sets the Value of a key in the object */
    setKey(key: keyof T, value: T[keyof T]): T[keyof T] {
        if (value !== this._value[key]) {
            this._value[key].unsubscribe(this.___keylisteners[key]);
            this._value[key] = value;
            value.subscribe(this.___keylisteners[key]);
            this.update();
        }
        return value;
    }

    /** This sets the value and dispatches an event*/
    set set(val: T) {
        if (this._value !== val) {
            for (const key in this._value) {
                this._value[key].unsubscribe(this.___keylisteners[key]);
            }
            for (const key in val) {
                this.___keylisteners[key] = val[key].subscribe(() => { this.___updateSubValue() });
            }
            this._value = val;
            this.update();
        }
    }

    /**This adds a function as an listener which is called at modifications to the object*/
    addSubValueListener(func: StateSubscriber<this>): typeof func {
        this.___subValueListeners.push(func);
        return func;
    }

    /**This removes a function as an event listener from the value*/
    removeSubValueListener(func: StateSubscriber<this>): typeof func {
        let index = this.___subValueListeners.indexOf(func);
        if (index != -1) {
            this.___subValueListeners.splice(index, 1);
        }
        return func;
    }

    /** Returns wether the value has listeners, true means it has at least a listener*/
    get inUseSubValue(): boolean {
        return this.___subValueListeners.length !== 0;
    }

    /** Returns wether the value has a specific listeners, true means it has that listener*/
    hasSubValueListener(func: StateSubscriber<this>): boolean {
        return this.___subValueListeners.indexOf(func) !== -1;
    }

    /** This sends an update without changing the value, can be used for more complex values*/
    protected ___updateSubValue() {
        if (this.___subValueListeners) {
            for (let i = 0, m = this.___subValueListeners.length; i < m; i++) {
                try {
                    this.___subValueListeners[i](this);
                } catch (e) {
                    console.warn('Failed while calling value listeners ', e);
                }
            }
        }
    }
}