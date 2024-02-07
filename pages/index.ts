import { Ok } from "@chocolatelib/result";
import { State, StateDerived } from "../src";

let state1 = new State(Ok(5));
let derived = new StateDerived(state1);
console.log(derived.get());
