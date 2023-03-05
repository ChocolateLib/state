import { State, StateSubscriber } from "./state";

export type StateArraySubValueSubscriber<T> = (index: number, value: T, state?: State<any>) => void

/**The function type for array value subscriber
 * @param index the index of addition or deletion
 * @param amount the amount of items is positive for addition or negative for removals
 * @param values contains any new elements added to the array*/
export type StateArrayStructureSubscriber<T> = (index: number, amount: number, values?: T[]) => void

/**State representing an array*/
export class StateArray<T> extends State<T[]> {
    private _indexlisteners: StateSubscriber<any>[] = [];
    private _subValueSubscriber: StateArraySubValueSubscriber<T>[] = [];
    private _structureSubscribers: StateArrayStructureSubscriber<any>[] = [];


    constructor(init: T[] = []) {
        super(init)
        for (let i = 0; i < init.length; i++) {
            const element = init[i];
            if (element instanceof State) {
                this._indexlisteners[i] = element.subscribe((val) => {
                    this._updateSubValue(i, val, <any>element);
                });
            }
        }
    }

    /** Support for iterator */
    *[Symbol.iterator]() {
        for (let i = 0; i < this._value.length; i++) {
            yield this._value[i]
        }
    }

    /** This sets the value and dispatches an event*/
    set set(value: T[]) {
        if (this._value !== value) {
            this.setSilent = value;
            this.update(value);
        }
    }

    /** This sets the value of the state*/
    set setSilent(value: T[]) {
        if (this._value !== value) {
            for (let i = 0; i < this._value.length; i++) {
                const element = this._value[i];
                if (element instanceof State) { element.unsubscribe(this._indexlisteners[i]); }
            }
            this._indexlisteners = [];
            for (let i = 0; i < value.length; i++) {
                const element = value[i];
                if (element instanceof State) {
                    this._indexlisteners[i] = element.subscribe((val) => {
                        this._updateSubValue(i, val, <any>element);
                    });
                }
            }
            this._value = value;
        }
    }

    /*       _____       _      __      __   _            
     *      / ____|     | |     \ \    / /  | |           
     *     | (___  _   _| |__    \ \  / /_ _| |_   _  ___ 
     *      \___ \| | | | '_ \    \ \/ / _` | | | | |/ _ \
     *      ____) | |_| | |_) |    \  / (_| | | |_| |  __/
     *     |_____/ \__,_|_.__/      \/ \__,_|_|\__,_|\___|*/

    /**This adds a function as a subscriber to the state objects sub value changes*/
    subscribeSubValue(func: StateArraySubValueSubscriber<T>): typeof func {
        this._subValueSubscriber.push(func);
        return func;
    }

    /**This removes a function as a subscriber to the state objects sub value changes*/
    unsubscribeSubValue(func: StateArraySubValueSubscriber<T>): typeof func {
        const index = this._subValueSubscriber.indexOf(func);
        if (index != -1) {
            this._subValueSubscriber.splice(index, 1);
        }
        return func;
    }

    /**Returns wether the state has subscribers for sub values, true means it has at least one subscriber*/
    get inUseSubValue(): boolean {
        return this._subValueSubscriber.length !== 0;
    }

    /**Returns wether the state has a specific sub value subscriber, true means it has that subscriber*/
    hasSubValueSubscriber(func: StateArraySubValueSubscriber<T>): boolean {
        return this._subValueSubscriber.indexOf(func) !== -1;
    }

    /** This calls all sub value subscribers with the given value*/
    protected _updateSubValue(index: number, value: T, state?: State<any>) {
        for (let i = 0, m = this._subValueSubscriber.length; i < m; i++) {
            try {
                this._subValueSubscriber[i](index, value, state);
            } catch (e) {
                console.warn('Failed while calling value listeners ', e);
            }
        }
    }

    /*       _____ _                   _                  
     *      / ____| |                 | |                 
     *     | (___ | |_ _ __ _   _  ___| |_ _   _ _ __ ___ 
     *      \___ \| __| '__| | | |/ __| __| | | | '__/ _ \
     *      ____) | |_| |  | |_| | (__| |_| |_| | | |  __/
     *     |_____/ \__|_|   \__,_|\___|\__|\__,_|_|  \___|*/

    /**Returns the Value of a key in the object */
    getIndex(index: number): T {
        return this._value[index];
    }

    /**Sets the Value of a key in the object */
    setIndex(index: number, element: T): T {
        if (this._value[index] !== element) {
            if (index > this._value.length) {
                let arrLen = this._value.length;
                let len = index - this._value.length + 1
                let fill = Array(len).fill(undefined);
                fill[len] = element;
                this._value[index] = element;
                if (element instanceof State) {
                    this._indexlisteners[index] = element.subscribe((val) => {
                        this._updateSubValue(index, val, <any>element);
                    });
                }
                this._updateStructure(arrLen, len, fill);
            } else {
                var removedElem = this._value[index];
                if (removedElem instanceof State) {
                    removedElem.unsubscribe(this._indexlisteners[index]);
                }
                this._value[index] = element;
                if (element instanceof State) {
                    element.subscribe(this._indexlisteners[index]);
                }
                this._updateStructure(index, 0, [element]);
            }
        }
        return element;
    }

    /**Removes the given element if it exists, returns true if any elements were found and deleted
     * @param val The value to locate in the array
     * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the search starts at index 0*/
    removeElement(val: T, fromIndex?: number): boolean {
        let i, y;
        i = y = this._value.indexOf(val, fromIndex);
        while (i !== -1) {
            var removedElem = this._value[i];
            if (removedElem instanceof State) {
                removedElem.unsubscribe(this._indexlisteners[i]);
                this._indexlisteners.splice(i, 1);
            }
            this._value.splice(i, 1);
            this._updateStructure(i, -1);
            i = this._value.indexOf(val, fromIndex);
        }
        return y !== -1;
    }

    /**Adds an element to the back of the array */
    push(...elem: T[]): void {
        let i = this._value.length;
        this._value.push(...elem);
        for (let y = i; y < elem.length; y++) {
            const element = elem[y];
            if (element instanceof State) {
                this._indexlisteners[y] = element.subscribe((val) => {
                    this._updateSubValue(y, val, <any>element);
                });
            }
        }
        this._updateStructure(i, elem.length, elem)
    }

    /**Adds an element to the front of the array */
    unshift(...elem: T[]): void {
        for (let i = 0; i < this._value.length; i++) {
            const element = this._value[i];
            if (element instanceof State) {
                element.unsubscribe(this._indexlisteners[i]);
            }
        }
        this._indexlisteners = [];
        this._value.unshift(...elem);
        for (let i = 0; i < this._value.length; i++) {
            const element = this._value[i];
            if (element instanceof State) {
                this._indexlisteners[i] = element.subscribe((val) => {
                    this._updateSubValue(i, val, <any>element);
                });
            }
        }
        this._updateStructure(0, elem.length, elem)
    }

    /**Removes an element from the back of the array*/
    pop(): T | undefined {
        let len = this._value.length;
        let res = this._value.pop();
        if (res instanceof State) {
            res.unsubscribe(<any>this._indexlisteners.pop());
        }
        if (len > this._value.length) {
            this._updateStructure(this._value.length, -1)
        }
        return res;
    }

    /**Removes an element from the front of the array*/
    shift(): T | undefined {
        for (let i = 0; i < this._value.length; i++) {
            const element = this._value[i];
            if (element instanceof State) {
                element.unsubscribe(this._indexlisteners[i]);
            }
        }
        this._indexlisteners = [];
        let len = this._value.length;
        let res = this._value.shift();
        for (let i = 0; i < this._value.length; i++) {
            const element = this._value[i];
            if (element instanceof State) {
                this._indexlisteners[i] = element.subscribe((val) => {
                    this._updateSubValue(i, val, <any>element);
                });
            }
        }
        if (len > this._value.length) {
            this._updateStructure(0, -1)
        }
        return res;
    }

    /** Removes elements from an array and, if necessary, inserts new elements in their place, returning the removed elements.
     * @param start The zero-based location in the array from which to start removing elements.
     * @param deleteCount The number of elements to remove.
     * @param elem Elements to insert into the array in place of the removed elements.
     * @returns An array containing the elements that were removed.*/
    splice(start: number, deleteCount: number, ...elem: T[]): T[] {
        for (let i = 0; i < this._value.length; i++) {
            const element = this._value[i];
            if (element instanceof State) {
                element.unsubscribe(this._indexlisteners[i]);
            }
        }
        this._indexlisteners = [];
        let res = this._value.splice(start, deleteCount, ...elem);
        for (let i = 0; i < this._value.length; i++) {
            const element = this._value[i];
            if (element instanceof State) {
                this._indexlisteners[i] = element.subscribe((val) => {
                    this._updateSubValue(i, val, <any>element);
                });
            }
        }
        if (res.length) {
            this._updateStructure(start, -res.length);
        }
        if (elem.length) {
            this._updateStructure(start, elem.length, elem);
        }
        return res;
    }

    /**Empties array of all elements*/
    empty(): void {
        for (let i = 0; i < this._value.length; i++) {
            const element = this._value[i];
            if (element instanceof State) {
                element.unsubscribe(this._indexlisteners[i]);
            }
        }
        this._indexlisteners = [];
        super.set = [];
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

    /**Returns length of array */
    get length(): number { return this._value.length; }

    /**This adds a function as a subscriber to the state objects structural changes*/
    subscribeStructure(func: StateArrayStructureSubscriber<T>): typeof func {
        this._structureSubscribers.push(func);
        return func;
    }

    /**This removes a function as a subscriber to the state objects structural changes*/
    unsubscribeStructure(func: StateArrayStructureSubscriber<T>): typeof func {
        const index = this._structureSubscribers.indexOf(func);
        if (index != -1) {
            this._structureSubscribers.splice(index, 1);
        } else {
            console.warn('Structure subscriber not found with state');
        }
        return func;
    }

    /**Returns wether the state has subscribers for object structure, true means it has at least one subscriber*/
    get inUseStructure(): boolean {
        return this._structureSubscribers.length !== 0;
    }

    /**Returns wether the state has a specific object structure subscriber, true means it has that subscriber*/
    hasStructureSubscriber(func: StateArrayStructureSubscriber<T>): boolean {
        return this._structureSubscribers.indexOf(func) !== -1;
    }

    /** This calls all object structure subscribers with the structure change*/
    private _updateStructure(index: number, amount: number, values?: T[]): void {
        for (let i = 0, m = this._structureSubscribers.length; i < m; i++) {
            try {
                this._structureSubscribers[i](index, amount, values);
            } catch (e) {
                console.warn('Failed while calling object structure subscribers ', e);
            }
        }
    }
}