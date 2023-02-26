import { Value, ValueArray, ValueLimited, ValueObjectFixed } from "./src";


let valObjMember1 = new Value(0);
let valObj = new ValueObjectFixed({ member1: valObjMember1 });

let valObjListener = valObj.subscribe((val) => {
    console.warn(val);
})

let valObjMember1_1 = new Value(5);
valObj.set = { member1: valObjMember1_1 }

let valListener = valObj.addSubValueListener((val) => {
    console.warn(val);
})

valObjMember1_1.set = 1;

console.warn(JSON.stringify(valObj));



