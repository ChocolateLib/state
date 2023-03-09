import { createState, createStateOptions } from "../src";

let test = async () => {
    await new Promise((a) => { setTimeout(a, 1) });
    let { options, set } = createStateOptions({});
    console.warn(options);
    return (options)
}

test().then((val) => {
    console.warn(val);
});

console.warn(await test());

let { state } = createState(2, undefined)