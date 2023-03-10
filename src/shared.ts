export interface StateOptions {
    name?: string,
    description?: string,
    icon?: () => SVGSVGElement,
    writable?: boolean,
};

//NUMBER
export interface StateNumberStep {
    /**Size of steps, eg 2 means 2,4,6,8 are allowed*/
    size: number,
    /**Step start, eg with size 1 and start 0.2, 0.2,1.2,2.2 are allowed */
    start?: number,
}

export interface StateNumberOptions extends StateOptions {
    min?: number;
    max?: number;
    decimals?: number;
    step?: StateNumberStep;
}

//STRING
export interface StateStringOptions extends StateOptions { }

//ENUM
export type StateEnumEntry = {
    name: string,
    description?: string,
    icon?: () => SVGSVGElement,
}

export type StateEnumList = {
    [key: string | number]: StateEnumEntry
}

export interface StateEnumOptions<T extends StateEnumList> extends StateOptions {
    enums: T,
}



export type StateSubscriber<T> = (val: T) => void

export interface StateRead<T> extends PromiseLike<T> {
    /**Makes the state awaitable */
    then<TResult1 = T, TResult2 = never>(onfulfilled: ((value: T) => TResult1 | PromiseLike<TResult1>), onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>)): PromiseLike<TResult1 | TResult2>
}

export interface StateSubscribe<T> extends StateRead<T> {
    /**This adds a function as a subscriber to the state
     * @param update set true to update subscriber*/
    subscribe<B extends StateSubscriber<T>>(func: B, update?: boolean): B
    /**This removes a function as a subscriber to the state*/
    unsubscribe<B extends StateSubscriber<T>>(func: B): B
}

export interface StateWrite<T> extends StateSubscribe<T> {
    /** This sets the value of the state and updates all subscribers*/
    set(val: T): void
}

export interface State<T, O extends StateOptions = StateOptions> extends StateWrite<T> {
    /**Returns the states options*/
    options(): StateSubscribe<O> | undefined
}


/**Function called when user sets value*/
export type StateUserSet<T> = (value: T, set: (value: T) => void) => void

/**Function used to change value of state by owner*/
export type StateSetter<T> = (value: T) => void
