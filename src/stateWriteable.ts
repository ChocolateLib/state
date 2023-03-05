import { State, stateUpdaterSubscribers } from "./state";
import * as types from "./types"


class StateWriteable<T> extends State<T>{

}

export const createStateWriteable = <T>(init: T, written?: types.StateWritableCheck<T>) => {
    let state = new StateWriteable<T>(init)
    return {
        state: state as types.StateWriteable<T>,
        write: (val: T) => { stateUpdaterSubscribers(state, val) }
    }
}