import * as types from "./types"


export interface StateMulti<T> extends State<T> {
    /**This adds a function as a subscriber to the state
     * @param update set true to update subscriber*/
    subscribe(func: types.StateSubscriber<T>, update?: boolean): types.StateSubscriber<any>
    /**This removes a function as a subscriber to the state*/
    unsubscribe(func: types.StateSubscriber<T>): types.StateSubscriber<any>
}