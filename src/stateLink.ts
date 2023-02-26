import { StateSubscriber, StateLike } from "./state";

/**Creates a link between two of more states
 * when linked the value of the first state is copied to the others*/
export class StateLink<T> {
    private _states: StateLike<T>[] = [];
    private _stateSubscribers: StateSubscriber<T>[] = [];

    /**Creates a link between two of more states
     * when linked the value of the first state is copied to the others
     * @param states initial Values to link
     * @param link if the link should be created instantly*/
    constructor(states?: StateLike<T>[], link?: boolean) {
        if (states) {
            this.states(states, link);
        }
    }

    /**Changes the values which are linked
    * @param states initial Values to link
    * @param link if the link should be created instantly*/
    states(states?: StateLike<T>[], link?: boolean): void {
        this.unlink();
        if (states && states.length > 1) {
            this._states = states;
            if (link) {
                this.link();
            }
        } else {
            this._states = [];
        }
    }

    /** Unlinks the values */
    unlink(): void {
        if (this._states.length) {
            for (let i = 0; i < this._states.length; i++) {
                this._states[i].unsubscribe(this._stateSubscribers[i]);
            }
        }
    }

    /**Links the states*/
    link(): void {
        if (this._states.length) {
            for (let i = 0; i < this._states.length; i++) {
                this._stateSubscribers[i] = this._states[i].subscribe((val) => {
                    for (let y = 0; y < this._states.length; y++) {
                        if (i !== y) {
                            this._states[y].set = val;
                        }
                    }
                }, i === 0);
            }
        }
    }
}