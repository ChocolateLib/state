import { State } from "./state";
import { StateDerived } from "./stateDerived";

/**State containing a boolean value*/
export class StateBoolean extends State<boolean> { }

/**State which Sums up multiple states*/
export class StateSummer extends StateDerived<number, number>{
    /**State which Sums up multiple states
     * @param states list of states to sum from*/
    constructor(states?: State<number>[]) {
        super((values) => {
            let sum = 0;
            for (let i = 0; i < values.length; i++) {
                sum += values[i];
            }
            return sum;
        }, states, (value: number, values: number[], valuesBuffer: number[], oldValue: number | undefined) => {
            let diff = (value - (oldValue || 0)) / this._states.length;
            for (let i = 0; i < this._states.length; i++) {
                values[i] = valuesBuffer[i] + diff;
            }
        }, true);
    }
}

/**State which averages up multiple states*/
export class StateAverage extends StateDerived<number, number> {
    /**State which averages up multiple states
    * @param states list of states to sum from*/
    constructor(states?: State<number>[]) {
        super((values) => {
            let sum = 0;
            for (let i = 0; i < values.length; i++) {
                sum += values[i];
            }
            return sum / values.length;
        }, states, (value: number, values: number[], valuesBuffer: number[], oldValue: number | undefined) => {
            const diff = (value - (oldValue || 0));
            for (let i = 0; i < this._states.length; i++) {
                values[i] = valuesBuffer[i] + diff;
            }
        }, true);
    }
}