import { State, StateLike } from "./state";
import { StateDerived } from "./stateDerived";

/**State containing a boolean value*/
export class StateBoolean extends State<boolean> { }

/**State containing a number value*/
export class StateNumber extends State<number> { }

/**State containing a string value*/
export class StateString extends State<string> { }

/**State which Sums up multiple states*/
export class StateSummer extends StateDerived<number, number>{
    /**State which Sums up multiple states
     * @param states list of states to sum from*/
    constructor(states?: StateLike<number>[]) {
        super(
            (values) => {
                let sum = 0;
                for (let i = 0; i < values.length; i++) {
                    sum += values[i];
                }
                return sum;
            }, states, (value: number, values: number[], valuesBuffer: number[]) => {
                let val = this.get;
                if (val instanceof Promise) {
                    val.then((val) => {
                        let diff = (value - (val || 0)) / this._states.length;
                        for (let i = 0; i < this._states.length; i++) {
                            values[i] = valuesBuffer[i] + diff;
                        }
                    })
                } else {
                    let diff = (value - (val || 0)) / this._states.length;
                    for (let i = 0; i < this._states.length; i++) {
                        values[i] = valuesBuffer[i] + diff;
                    }
                }
            });
    }
}

/**State which averages up multiple states*/
export class StateAverage extends StateDerived<number, number> {
    /**State which averages up multiple states
    * @param states list of states to sum from*/
    constructor(states?: StateLike<number>[]) {
        super((values) => {
            let sum = 0;
            for (let i = 0; i < values.length; i++) {
                sum += values[i];
            }
            return sum / values.length;
        }, states, (value: number, values: number[], valuesBuffer: number[]) => {
            let val = this.get;
            if (val instanceof Promise) {
                val.then((val) => {
                    let diff = (value - (val || 0));
                    for (let i = 0; i < this._states.length; i++) {
                        values[i] = valuesBuffer[i] + diff;
                    }
                })
            } else {
                let diff = (value - (val || 0));
                for (let i = 0; i < this._states.length; i++) {
                    values[i] = valuesBuffer[i] + diff;
                }
            }
        });
    }
}