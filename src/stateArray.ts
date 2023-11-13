// import { StateBase } from "./stateBase";
// import { StateChecker, StateLimiter, StateRelated, StateRelater, StateResult, StateWrite } from "./types";

// export type StateArrayStruct<T> = {
//     array: Readonly<T[]>,
//     removed?: { index: number, items: Readonly<T[]> },
//     added?: { index: number, items: Readonly<T[]> },
//     changed?: { index: number, items: Readonly<T[]> },
// }

// export class StateArray<T, L extends {} = any> extends StateBase<StateArrayStruct<T>, L> implements StateWrite<Readonly<T[]>, T[], L> {
//     /**Creates a state which holds a string
//      * @param init initial value for state, use undefined to indicate that state does not have a value yet
//      * @param setter function called when state value is set via setter, set true let state set it's own value 
//      * @param checker function to allow state users to check if a given value is valid for the state
//      * @param limiter function to allow state users to limit a given value to state limit
//      * @param related function returning the related states to this one*/
//     constructor(
//         init: T[] = [],
//         setter?: StateArraySetter<T, L> | boolean,
//         checker?: StateChecker<T[]>,
//         limiter?: StateLimiter<T[]>,
//         related?: StateRelater<L>
//     ) {
//         super();
//         if (setter)
//             this.#setter = setter;
//         if (checker)
//             this.#check = checker;
//         if (limiter)
//             this.#limit = limiter;
//         if (related)
//             this.#related = related;
//         this.#value = init;
//     }

//     #value: T[];
//     #setter: StateArraySetter<T, L> | true | undefined;
//     #check: StateChecker<T[]> | undefined;
//     #limit: StateLimiter<T[]> | undefined;
//     #related: StateRelater<L> | undefined;

//     //Read
//     async then<TResult1 = T>(func: ((value: StateResult<T[]>) => TResult1 | PromiseLike<TResult1>)): Promise<TResult1> {
//         return func([...this.#value]);
//     }

//     related(): StateRelated<L> | undefined {
//         return (this.#related ? this.#related() : undefined)
//     }

//     //Write
//     write(value: T[], meta?: StateArrayUpdateMeta<T>): void {
//         if (this.#setter && this.#value !== value)
//             if (this.#setter === true)
//                 this.set(value);
//             else
//                 this.#setter(value, this, meta);
//     }

//     check(value: T[]): string | undefined {
//         return (this.#check ? this.#check(value) : undefined)
//     }
//     limit(value: T[]): T[] {
//         return (this.#limit ? this.#limit(value) : value);
//     }


//     //Owner Methods
//     /**Changes the array and updates subscribers */
//     set(value: T[]) {
//         this.#value = value;
//         this.updateSubscribers(value);
//     }


//     // /**Returns the internal array, if any modifications are done to it use set(array) to update subscribers*/
//     // get(): T[] {
//     //     return this.#value;
//     // }
//     // /**Sets the value at an index*/
//     // setIndex(index: number, ...value: T[]) {
//     //     for (let i = 0; i < value.length; i++) {
//     //         this.#value[index + i] = value[i];
//     //     }
//     //     this.updateSubscribersMeta(this.#value, { changed: { index, length: value.length } });
//     // }
//     // /**The iterator for the state array to allow looping*/
//     // *[Symbol.iterator](): Iterator<T> {
//     //     for (let i = 0; i < this.#value.length; i++)
//     //         yield this.#value[i];
//     // }
//     // /**Returns the item located at the specified index.
//     //  * @param index The zero-based index of the desired code unit. A negative index will count back from the last item.*/
//     // at(index: number): T | undefined {
//     //     return this.#value.at(index);
//     // }
//     // /**Combines two or more arrays.
//     //  * This method returns a new array without modifying any existing arrays.
//     //  * @param items Additional arrays and/or items to add to the end of the array.*/
//     // concat(...items: (T | ConcatArray<T>)[]): T[] {
//     //     return this.#value.concat(...items);
//     // }
//     // /**Returns the this object after copying a section of the array identified by start and end to the same array starting at position target
//     //  * @param target If target is negative, it is treated as length+target where length is the length of the array.
//     //  * @param start If start is negative, it is treated as length+start. If end is negative, it is treated as length+end.
//     //  * @param end If not specified, length of the this object is used as its default value.*/
//     // copyWithin(target: number, start: number, end: number = this.#value.length): T[] {
//     //     if (start > end)
//     //         return this.#value
//     //     this.#value.copyWithin(target, start, end);
//     //     if (target < 0)
//     //         target = this.#value.length + target;
//     //     this._updateSubscribersMeta(this.#value, undefined, { changed: { index: target, length: Math.min(end - start, this.#value.length - target) } });
//     //     return this.#value
//     // }

//     // /**Returns an iterable of key, value pairs for every entry in the array*/
//     // *entries(): IterableIterator<[number, T]> {
//     //     for (let i = 0; i < this.#value.length; i++)
//     //         yield [i, this.#value[i]];
//     // }
//     // /**Determines whether all the members of an array satisfy the specified test.
//     //  * @param predicate A function that accepts up to three arguments. The every method calls the predicate function for each element in the array until the predicate returns a value which is coercible to the Boolean value false, or until the end of the array.*/
//     // every(predicate: (value: T, index: number, array: T[]) => boolean): boolean {
//     //     return this.#value.every(predicate)
//     // }
//     // /**Changes all array elements from `start` to `end` index to a static `value` and returns the modified array
//     //  * @param value value to fill array section with
//     //  * @param start index to start filling the array at. If start is negative, it is treated as length+start where length is the length of the array.
//     //  * @param end index to stop filling the array at. If end is negative, it is treated as length+end.*/
//     // fill(value: T, start: number = 0, end: number = this.#value.length): T[] {
//     //     if (start > end)
//     //         return this.#value;
//     //     this.#value.fill(value, start, end);
//     //     if (start < 0)
//     //         start = this.#value.length + start;
//     //     if (end < 0)
//     //         end = this.#value.length + end;
//     //     this._updateSubscribersMeta(this.#value, undefined, { changed: { index: start, length: Math.min(end - start, this.#value.length - start) } });
//     //     return this.#value;
//     // }
//     // /**Returns the elements of an array that meet the condition specified in a callback function.
//     //  * @param predicate A function that accepts up to three arguments. The filter method calls the predicate function one time for each element in the array.*/
//     // filter(predicate: (value: T, index: number, array: T[]) => unknown): T[] {
//     //     return this.#value.filter(predicate);
//     // }
//     // /**Returns the value of the first element in the array where predicate is true, and undefined otherwise.
//     //  * @param predicate find calls predicate once for each element of the array, in ascending order, until it finds one where predicate returns true. If such an element is found, find immediately returns that element value. Otherwise, find returns undefined.*/
//     // find(predicate: (value: T, index: number, obj: T[]) => unknown): T | undefined {
//     //     return this.#value.find(predicate);
//     // }
//     // /**Returns the index of the first element in the array where predicate is true, and -1 otherwise.
//     //  * @param predicate find calls predicate once for each element of the array, in ascending order, until it finds one where predicate returns true. If such an element is found, findIndex immediately returns that element index. Otherwise, findIndex returns -1.*/
//     // findIndex(predicate: (value: T, index: number, obj: T[]) => unknown): number {
//     //     return this.#value.findIndex(predicate);
//     // }
//     // /**Returns the value of the last element in the array where predicate is true, and undefined otherwise.
//     //  * @param predicate findLast calls predicate once for each element of the array, in descending order, until it finds one where predicate returns true. If such an element is found, findLast immediately returns that element value. Otherwise, findLast returns undefined.*/
//     // findLast(predicate: (value: T, index: number, obj: T[]) => unknown): T | undefined {
//     //     return this.#value.findLast(predicate);
//     // }
//     // /**Returns the index of the last element in the array where predicate is true, and -1 otherwise.
//     //  * @param predicate findLastIndex calls predicate once for each element of the array, in descending order, until it finds one where predicate returns true. If such an element is found, findLastIndex immediately returns that element index. Otherwise, findLastIndex returns -1.*/
//     // findLastIndex(predicate: (value: T, index: number, obj: T[]) => unknown): number {
//     //     return this.#value.findLastIndex(predicate);
//     // }
//     // /**Returns a new array with all sub-array elements concatenated into it recursively up to the specified depth.
//     //  * @param depth The maximum recursion depth*/
//     // flat<D extends number = 1>(depth?: D): FlatArray<T[], D>[] {
//     //     return this.#value.flat(depth);
//     // }
//     // /**Calls a defined callback function on each element of an array. Then, flattens the result into a new array.
//     //  * This is identical to a map followed by flat with depth 1.
//     //  * @param callback A function that accepts up to three arguments. The flatMap method calls the callback function one time for each element in the array.*/
//     // flatMap<U, This = undefined>(callback: (this: This, value: T, index: number, array: T[]) => U | ReadonlyArray<U>): U[] {
//     //     return this.#value.flatMap(callback);
//     // }
//     // /**Performs the specified action for each element in an array.
//     //  * @param callbackfn  A function that accepts up to three arguments. forEach calls the callbackfn function one time for each element in the array.*/
//     // forEach(callbackfn: (value: T, index: number, array: T[]) => void): void {
//     //     return this.#value.forEach(callbackfn);
//     // }
//     // /**Determines whether an array includes a certain element, returning true or false as appropriate.
//     //  * @param searchElement The element to search for.
//     //  * @param fromIndex The position in this array at which to begin searching for searchElement.*/
//     // includes(searchElement: T, fromIndex?: number): boolean {
//     //     return this.#value.includes(searchElement, fromIndex);
//     // }
//     // /**Returns the index of the first occurrence of a value in an array, or -1 if it is not present.
//     //  * @param searchElement The value to locate in the array.
//     //  * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the search starts at index 0.*/
//     // indexOf(searchElement: T, fromIndex?: number): number {
//     //     return this.#value.indexOf(searchElement, fromIndex);
//     // }
//     // /**Adds all the elements of an array into a string, separated by the specified separator string.
//     //  * @param separator A string used to separate one element of the array from the next in the resulting string. If omitted, the array elements are separated with a comma.*/
//     // join(separator?: string): string {
//     //     return this.#value.join(separator);
//     // }
//     // /**Returns an iterable of keys in the array*/
//     // *keys(): IterableIterator<number> {
//     //     for (let i = 0; i < this.#value.length; i++)
//     //         yield i;
//     // }
//     // /**Returns the index of the last occurrence of a specified value in an array, or -1 if it is not present.
//     //  * @param searchElement The value to locate in the array.
//     //  * @param fromIndex The array index at which to begin searching backward. If fromIndex is omitted, the search starts at the last index in the array.*/
//     // lastIndexOf(searchElement: T, fromIndex?: number): number {
//     //     return this.#value.lastIndexOf(searchElement, fromIndex);
//     // }
//     // /**Calls a defined callback function on each element of an array, and returns an array that contains the results.
//     //  * @param callbackfn A function that accepts up to three arguments. The map method calls the callbackfn function one time for each element in the array.*/
//     // map<U>(callbackfn: (value: T, index: number, array: T[]) => U): U[] {
//     //     return this.#value.map(callbackfn);
//     // }
//     // /** Removes the last element from an array and returns it.
//     //  * If the array is empty, undefined is returned and the array is not modified.*/
//     // pop(): T | undefined {
//     //     if (this.#value.length > 0) {
//     //         let popped = this.#value.pop();
//     //         this.updateSubscribersMeta(this.#value, { removed: { index: this.#value.length, length: 1, items: [<T>popped] } });
//     //         return popped;
//     //     }
//     //     return undefined
//     // }
//     // /** Appends new elements to the end of an array, and returns the new length of the array.
//     //  * @param items New elements to add to the array.*/
//     // push(...items: T[]): number {
//     //     let index = this.#value.length;
//     //     let newLen = this.#value.push(...items);
//     //     this.updateSubscribersMeta(this.#value, { added: { index, length: items.length } });
//     //     return newLen;
//     // }
//     // /**Calls the specified callback function for all the elements in an array. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
//     //  * @param callbackfn A function that accepts up to four arguments. The reduce method calls the callbackfn function one time for each element in the array.
//     //  * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.*/
//     // reduce(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T, initialValue?: T): T {
//     //     return this.#value.reduce(callbackfn, initialValue as T);
//     // }
//     // /**Calls the specified callback function for all the elements in an array, in descending order. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
//     //  * @param callbackfn A function that accepts up to four arguments. The reduceRight method calls the callbackfn function one time for each element in the array.
//     //  * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.*/
//     // reduceRight(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T, initialValue?: T): T {
//     //     return this.#value.reduceRight(callbackfn, initialValue as T);
//     // }
//     // /**Reverses the elements in an array in place.
//     //  * This method mutates the array and returns a reference to the same array.*/
//     // reverse(): T[] {
//     //     this.#value.reverse();
//     //     this._updateSubscribersMeta(this.#value, undefined, { changed: { index: 0, length: this.#value.length } });
//     //     return this.#value;
//     // }
//     // /** Removes the first element from an array and returns it.
//     //  * If the array is empty, undefined is returned and the array is not modified.*/
//     // shift(): T | undefined {
//     //     if (this.#value.length > 0) {
//     //         let shifted = this.#value.shift();
//     //         this._updateSubscribersMeta(this.#value, undefined, { removed: { index: 0, length: 1, items: [<T>shifted] } });
//     //         return shifted;
//     //     }
//     //     return undefined
//     // }
//     // /**Returns a copy of a section of an array.
//     //  * For both start and end, a negative index can be used to indicate an offset from the end of the array.
//     //  * For example, -2 refers to the second to last element of the array.
//     //  * @param start The beginning index of the specified portion of the array. If start is undefined, then the slice begins at index 0.
//     //  * @param end The end index of the specified portion of the array. This is exclusive of the element at the index 'end'. If end is undefined, then the slice extends to the end of the array.*/
//     // slice(start?: number, end?: number): T[] {
//     //     return this.#value.slice(start, end);
//     // }
//     // /**Determines whether the specified callback function returns true for any element of an array.
//     //  * @param predicate A function that accepts up to three arguments. The some method calls the predicate function for each element in the array until the predicate returns a value which is coercible to the Boolean value true, or until the end of the array.*/
//     // some(predicate: (value: T, index: number, array: T[]) => unknown): boolean {
//     //     return this.#value.some(predicate)
//     // }
//     // /**Sorts an array in place.
//     //  * This method mutates the array and returns a reference to the same array.
//     //  * @param compareFn Function used to determine the order of the elements. It is expected to return a negative value if the first argument is less than the second argument, zero if they're equal, and a positive value otherwise. If omitted, the elements are sorted in ascending, ASCII character order.
//     //  * [11,2,22,1].sort((a, b) => a - b)*/
//     // sort(compareFn?: (a: T, b: T) => number): T[] {
//     //     this.#value.sort(compareFn);
//     //     this._updateSubscribersMeta(this.#value, undefined, { changed: { index: 0, length: this.#value.length } });
//     //     return this.#value;
//     // }
//     // /** Removes elements from an array and, if necessary, inserts new elements in their place, returning the deleted elements.
//     //  * @param start The zero-based location in the array from which to start removing elements.
//     //  * @param deleteCount The number of elements to remove.
//     //  * @param items Elements to insert into the array in place of the deleted elements.
//     //  * @returns An array containing the elements that were deleted.*/
//     // splice(start: number, deleteCount: number, ...items: T[]): T[] {
//     //     let removed = this.#value.splice(start, deleteCount, ...items);
//     //     if (items.length > 0 || removed.length > 0)
//     //         this._updateSubscribersMeta(this.#value, undefined, {
//     //             removed: { index: start, length: removed.length, items: removed },
//     //             added: { index: start, length: items.length },
//     //         });
//     //     return removed;
//     // }
//     // /**Returns a reversed copy of the array*/
//     // toReversed(): T[] {
//     //     return [...this.#value].reverse();
//     // }
//     // /**Returns a sorted copy of the array
//     //  * @param compareFn Function used to determine the order of the elements. It is expected to return a negative value if the first argument is less than the second argument, zero if they're equal, and a positive value otherwise. If omitted, the elements are sorted in ascending, ASCII character order.
//     //  * [11,2,22,1].sort((a, b) => a - b)*/
//     // toSorted(compareFn?: (a: T, b: T) => number): T[] {
//     //     return [...this.#value].sort(compareFn);
//     // }
//     // /** Removes elements from an array and, if necessary, inserts new elements in their place, returning the deleted elements.
//     //  * @param start The zero-based location in the array from which to start removing elements.
//     //  * @param deleteCount The number of elements to remove.
//     //  * @param items Elements to insert into the array in place of the deleted elements.
//     //  * @returns An array containing the elements that were deleted.*/
//     // toSpliced(start: number, deleteCount: number, ...items: T[]): T[] {
//     //     return [...this.#value].splice(start, deleteCount, ...items);
//     // }
//     // /**Returns a string representation of an array.*/
//     // toString(): string {
//     //     return this.#value.toString();
//     // }

//     // /**Inserts new elements at the start of an array, and returns the new length of the array.
//     //  * @param items Elements to insert at the start of the array.*/
//     // unshift(...items: T[]): number {
//     //     let newLen = this.#value.unshift(...items);
//     //     this.updateSubscribersMeta(this.#value, { added: { index: 0, length: items.length } });
//     //     return newLen;
//     // }

//     // /**Returns an iterable of values in the array*/
//     // *values(): IterableIterator<T> {
//     //     for (let i = 0; i < this.#value.length; i++)
//     //         yield this.#value[i];
//     // }

//     // /**Modifies the given array with the change coming from the StateArray subscribe events
//     //  * sometimes it will returns a new array instead of modifing the given one, because it is less work, so make sure to always use the return array.
//     //  * @param value value from subscribe event
//     //  * @param meta meta data from subscribe event
//     //  * @param clone the array to perform modifications on
//     //  * @param itemFunc function used to generate new items for the clone array*/
//     // static applyMetaChange<T, C>(value: readonly T[], meta: StateArrayUpdateMeta<T> | undefined, clone: C[], itemFunc: (item: T) => C): C[] {
//     //     if (meta) {
//     //         if (meta.added) {
//     //             var newArr = Array(meta.added.length);
//     //             for (let i = 0; i < newArr.length; i++)
//     //                 newArr[i] = itemFunc(value[meta.added.index + i]);
//     //             if (meta.removed)
//     //                 if (meta.added.index === meta.removed.index)
//     //                     clone.splice(meta.removed.index, meta.removed.items.length, ...newArr);
//     //                 else {
//     //                     clone.splice(meta.removed.index, meta.removed.items.length);
//     //                     clone.splice(meta.added.index, 0, ...newArr);
//     //                 }
//     //             else
//     //                 clone.splice(meta.added.index, 0, ...newArr);
//     //         } else if (meta.removed)
//     //             clone.splice(meta.removed.index, meta.removed.items.length);
//     //         if (meta.changed)
//     //             for (let i = 0; i < meta.changed.length; i++)
//     //                 clone[meta.changed.index + i] = itemFunc(value[meta.changed.index + i]);
//     //         return clone;
//     //     } else {
//     //         let newArr = Array(value.length);
//     //         for (let i = 0; i < value.length; i++)
//     //             newArr[i] = itemFunc(value[i]);
//     //         return newArr;
//     //     }
//     // }
// }