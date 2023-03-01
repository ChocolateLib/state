import { State } from "./state";

/**The function type for array value subscriber
 * @param index the index of addition or deletion
 * @param amount the amount of items is positive for addition or negative for removals
 * @param values contains any new elements added to the array*/
export type StateArraySubscriber<T> = (index: number, amount: number, values?: T[]) => void

/**State representing an array*/
export class StateArray<T> extends State<T[]> {
    private _arraySubscribers: StateArraySubscriber<any>[] = [];

    /**Calls all array subscribers
     * @param index the index of addition or deletion
     * @param amount the amount of items is positive for addition or negative for removals
     * @param values contains any new elements added to the array*/
    protected arrayUpdate(index: number, amount: number, values?: T[]) {
        Object.freeze(values);
        for (let i = 0, m = this._arraySubscribers.length; i < m; i++) {
            try {
                this._arraySubscribers[i](index, amount, values);
            } catch (e) {
                console.warn('Failed while calling subscribers ', e);
            }
        }
    }

    /**This adds a function as a subscriber to the state*/
    subscribeArray<B = T>(func: StateArraySubscriber<B>): typeof func {
        this._arraySubscribers.push(func);
        return func;
    }

    /**This removes a function as a subscriber to the state*/
    unsubscribeArray<B = T>(func: StateArraySubscriber<B>): typeof func {
        let index = this._arraySubscribers.indexOf(func);
        if (index != -1) {
            this._arraySubscribers.splice(index, 1);
        }
        return func;
    }

    /** Returns wether the state has subscribers, true means it has at least one subscribers*/
    get arrayInUse(): boolean {
        return this._arraySubscribers.length !== 0;
    }

    /** Returns wether the state has a specific subscriber, true means it has that subscriber*/
    hasArraySubscriber(func: StateArraySubscriber<T>): boolean {
        return this._arraySubscribers.indexOf(func) !== -1;
    }

    /**Adds an element to the back of the array */
    push(...elem: T[]): void {
        let i = this._value.length;
        this._value.push(...elem);
        this.arrayUpdate(i, elem.length, elem)
    }

    /**Adds an element to the front of the array */
    unshift(...elem: T[]): void {
        this._value.unshift(...elem);
        this.arrayUpdate(0, elem.length, elem)
    }

    /**Removes an element from the back of the array*/
    pop(): T | undefined {
        let len = this._value.length;
        let res = this._value.pop();
        if (len > this._value.length) {
            this.arrayUpdate(this._value.length, -1)
        }
        return res;
    }

    /**Removes an element from the front of the array*/
    shift(): T | undefined {
        let len = this._value.length;
        let res = this._value.shift();
        if (len > this._value.length) {
            this.arrayUpdate(0, -1)
        }
        return res;
    }

    /** Removes elements from an array and, if necessary, inserts new elements in their place, returning the removed elements.
     * @param start The zero-based location in the array from which to start removing elements.
     * @param deleteCount The number of elements to remove.
     * @param elem Elements to insert into the array in place of the removed elements.
     * @returns An array containing the elements that were removed.*/
    splice(start: number, deleteCount: number, ...elem: T[]): T[] {
        let res = this._value.splice(start, deleteCount, ...elem);
        if (res.length) {
            this.arrayUpdate(start, -res.length);
        }
        if (elem.length) {
            this.arrayUpdate(start, elem.length, elem);
        }
        return res;
    }

    /**Returns the index of the first occurrence of a value in an array, or -1 if it is not present
     * @param val The value to locate in the array
     * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the search starts at index 0*/
    indexOf(val: T, fromIndex?: number): number {
        return this._value.indexOf(val, fromIndex);
    }

    /**Returns if the given item is included in the array*/
    includes(val: T): boolean {
        return this._value.includes(val);
    }

    /**Empties array of all elements*/
    empty(): void {
        super.set = [];
    }

    /**Returns length of array */
    get length(): number { return this._value.length; }

    /**Removes the given element if it exists, returns true if any elements were found and deleted
     * @param val The value to locate in the array
     * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the search starts at index 0*/
    remove(val: T, fromIndex?: number): boolean {
        let i, y;
        i = y = this._value.indexOf(val, fromIndex);
        while (i !== -1) {
            this._value.splice(i, 1);
            this.arrayUpdate(i, -1);
            i = this._value.indexOf(val, fromIndex);
        }
        return y !== -1;
    }

    /**Gets the value from the given index*/
    getIndex(index: number): T | undefined {
        return this._value[index];
    }

    /**Sets the value from the given index
     * @param index the index to set the value of
     * @param value the value to set the index to
     * @returns the given value */
    setIndex(index: number, value: T): T {
        if (this._value[index] !== value) {
            if (index > this._value.length) {
                let arrLen = this._value.length;
                let len = index - this._value.length + 1
                let fill = Array(len).fill(undefined);
                fill[len] = value;
                this._value[index] = value;
                this.arrayUpdate(arrLen, len, fill);
            } else {
                this._value[index] = value;
                this.arrayUpdate(index, 0, [value]);
            }
        }
        return value
    }

    /** This method can compare a value to the states value, returns true if values are different*/
    compare(val: any): boolean {
        switch (typeof val) {
            case 'object': {
                if (val instanceof Array) {
                    if (val.length === this._value.length) {
                        for (let i = 0; i < this._value.length; i++) {
                            if (this._value[i] !== val[i]) {
                                return true;
                            }
                        }
                        return false;
                    } else {
                        return true;
                    }
                } else if (val instanceof StateArray) {
                    if (val._value.length === this._value.length) {
                        for (let i = 0; i < this._value.length; i++) {
                            if (this._value[i] !== val._value[i]) {
                                return true;
                            }
                        }
                        return false;
                    } else {
                        return true;
                    }
                } else {
                    return true;
                }
            }
            default:
                return true;
        }
    }
}