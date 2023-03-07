import { createState, StateOptions, StateRead, StateSubscribe, StateValueOptions, } from "../src"
import { instanceOfState, State } from "../src/shared"

let yo: {
    state: State<number, StateValueOptions>;
    set: (value: number) => void;
    setOptions: (options: StateValueOptions) => void;
}[] = []
window.yo = yo;

console.time('Function #1');
for (let i = 0; i < 100000; i++) {
    yo[i] = createState(1);
}
console.timeEnd('Function #1')

// {
//     let { state, set, setOptions } = createState(2, true, { writeable: false })
//     state.then(async (val) => { console.warn('1', val); })
//     console.warn('2', state.get());
//     state.set(4)
//     console.warn('3', await state);
//     setOptions({ writeable: true })
//     state.set(4)
//     console.warn('3', await state);

//     let err = false
//     state.then((val) => {
//         console.warn('æ1', val);
//         if (err) {
//             return 2;
//         } else {
//             throw {};
//         }
//     }).then((val) => {
//         console.warn('æ2', val);
//     }, (val) => {
//         console.warn('æ3', val);
//     })

// }

// {
//     let test = (state: StateSubscribe<number | string> & StateRead<number | string>) => {
//         state.subscribe((val) => {

//         })
//     }
//     let { state, set } = createState(2)
//     let test2 = state.subscribe((val) => {
//         console.warn(val);

//     })
//     set(2)
//     test(state)
//     state.then((val) => {
//         console.warn('1', val);
//         throw new Error('yo')
//     }).then((val) => {
//         console.warn('2a', val);
//     }, (val) => {
//         console.warn('2b', val);
//     })
// }

// {
//     interface numbs extends StateValueOptions {
//         min?: number
//     }
//     let test = (state: StateOptions<numbs>) => {
//         state.options?.name
//     }
//     let { state, set, setOptions } = createState(2, undefined, { name: '' })
//     let test2 = state.subscribe((val) => {
//         console.warn(val);

//     })

//     if (state.options) {
//         state.options.name
//     }
//     set(2)
//     setOptions({})
//     test(state)
//     state.then((val) => {
//         console.warn('1', val);
//         throw new Error('yo')
//     }).then((val) => {
//         console.warn('2a', val);
//     }, (val) => {
//         console.warn('2b', val);
//     })

//     instanceOfState(state);
// }