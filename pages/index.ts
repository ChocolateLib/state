import { createState, createStateOptions } from "../src";
import { initSettings } from "./index copy";

let setting = initSettings('test', 'asdf', 'yoyoyo');

let { state, set } = await setting.makeBooleanSetting('asdf', (value) => {
    console.warn(value);
    set(value);
}, false, { name: 'Test Setting', description: 'asdf' })

console.warn(await state);
window.yo = state;

// let test = async () => {
//     await new Promise((a) => { setTimeout(a, 1) });
//     let { options, set } = createStateOptions({});
//     console.warn(options);
//     return (options)
// }

// test().then((val) => {
//     console.warn(val);
// });

// console.warn(await test());

// let { state } = createState(2, undefined)

