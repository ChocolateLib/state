import { createStateValue, StateOptions, StateRead, StateSubscribe, StateValueOptions, } from "../src"
import { instanceOfState } from "../src/shared"

{
    let test = (state: StateSubscribe<number | string> & StateRead<number | string>) => {
        state.subscribe((val) => {

        })
    }
    let { state, set } = createStateValue(2)
    let test2 = state.subscribe((val) => {
        console.warn(val);

    })
    set(2)
    test(state)
    state.then((val) => {
        console.warn('1', val);
        throw new Error('yo')
    }).then((val) => {
        console.warn('2a', val);
    }, (val) => {
        console.warn('2b', val);
    })
}

{
    interface numbs extends StateValueOptions {
        min?: number
    }
    let test = (state: StateOptions<numbs>) => {
        state.options?.name
    }
    let { state, set, setOptions } = createStateValue(2, undefined, { name: '' })
    let test2 = state.subscribe((val) => {
        console.warn(val);

    })

    if (state.options) {
        state.options.name
    }
    set(2)
    setOptions({})
    test(state)
    state.then((val) => {
        console.warn('1', val);
        throw new Error('yo')
    }).then((val) => {
        console.warn('2a', val);
    }, (val) => {
        console.warn('2b', val);
    })

    instanceOfState(state);
}