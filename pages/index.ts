import { createState, StateRead, } from "../src"
import { StateDefaultOptions, StateOptions, StateSubscribe } from "../src/state"

{
    let test = (state: StateSubscribe<number | string> & StateRead<number | string>) => {
        state.subscribe((val) => {

        })
    }
    let { state, set } = createState(2)
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
    interface numbs extends StateOptions {
        min?: number
    }
    let test = (state: numbs) => {

    }
    let { state, set, setOptions } = createState(2, undefined, { name: '', yoyo: 5 })
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
}