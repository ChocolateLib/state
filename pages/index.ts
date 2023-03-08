import { createState, createStateOptions } from "../src";

let test = async () => {
    let { options, set } = createStateOptions({});
    return (options)
}

console.warn(await test());


let { state } = createState(2, undefined,)