import { State, StateSubscriber } from "./state"

export type StateObjectSubValueSubscriber = (key: string, value: any, state?: State<any>) => void

type KeyUpdate = { added?: { [key: string]: any }, removed?: { [key: string]: any } };
export type StateObjectStructureSubscriber = (keys: KeyUpdate) => void

export type StateObjectDynamic = { [key: string]: any }

/**State for representing an object made up of other states
 * Two usage examples
 * 
 * Fixed symbols has typechecking for keys
 * const object = {
 *  's1': new State(1),
 *  's2': new State(2),
 * }
 * It is a good idea to freze the object
 * Object.freeze(object);
 * let stateObject = new StateObjectOfStates('e1', object);
 * 
 * Dynamic symbols
 * let object: StateObjectDynamic = {
 *  's1': new State(1),
 *  's2': new State(2),
 * }
 * let stateObject = new StateObjectOfStates('e1', object); */
export class StateObject<T extends {}> extends State<T> {
    private _keylisteners: { [Property in keyof T]: StateSubscriber<any> } = <any>{}
    private _subValueSubscriber: StateObjectSubValueSubscriber[] = [];
    private _structureSubscriber: StateObjectStructureSubscriber[] = [];

    constructor(init: T) {
        super(init)
        for (const key in init) {
            const member = init[key];
            if (member instanceof State) {
                this._keylisteners[key] = member.subscribe((val) => {
                    this._updateSubValue(key, val, <State<any>>member)
                });
            }
        }
    }

    *[Symbol.iterator]() {

    }

    /** This sets the value and dispatches an event*/
    set set(value: T) {
        if (this._value !== value) {
            this.setSilent = value;
            this.update(value);
        }
    }

    /** This sets the value of the state*/
    set setSilent(value: T) {
        if (this._value !== value) {
            for (const key in this._value) {
                const member = this._value[key];
                if (member instanceof State) {
                    member.unsubscribe(this._keylisteners[key]);
                }
            }
            this._keylisteners = <any>{}
            for (const key in value) {
                const member = this._value[key];
                if (member instanceof State) {
                    this._keylisteners[key] = member.subscribe((val) => {
                        this._updateSubValue(key, val, <State<any>>value[key])
                    });
                }
            }
            this._value = value;
        }
    }

    /*       _____       _      __      __   _            
     *      / ____|     | |     \ \    / /  | |           
     *     | (___  _   _| |__    \ \  / /_ _| |_   _  ___ 
     *      \___ \| | | | '_ \    \ \/ / _` | | | | |/ _ \
     *      ____) | |_| | |_) |    \  / (_| | | |_| |  __/
     *     |_____/ \__,_|_.__/      \/ \__,_|_|\__,_|\___|*/

    /**This adds a function as a subscriber to the state objects sub value changes*/
    addSubValueListener(func: StateObjectSubValueSubscriber): typeof func {
        this._subValueSubscriber.push(func);
        return func;
    }

    /**This removes a function as a subscriber to the state objects sub value changes*/
    removeSubValueListener(func: StateObjectSubValueSubscriber): typeof func {
        const index = this._subValueSubscriber.indexOf(func);
        if (index != -1) {
            this._subValueSubscriber.splice(index, 1);
        }
        return func;
    }

    /**Returns wether the state has subscribers for sub values, true means it has at least one subscriber*/
    get inUseSubValue(): boolean {
        return this._subValueSubscriber.length !== 0;
    }

    /**Returns wether the state has a specific sub value subscriber, true means it has that subscriber*/
    hasSubValueListener(func: StateObjectSubValueSubscriber): boolean {
        return this._subValueSubscriber.indexOf(func) !== -1;
    }

    /** This calls all sub value subscribers with the given value*/
    protected _updateSubValue(key: keyof T, value: any, state?: State<any>) {
        for (let i = 0, m = this._subValueSubscriber.length; i < m; i++) {
            try {
                this._subValueSubscriber[i](<string>key, value, state);
            } catch (e) {
                console.warn('Failed while calling value listeners ', e);
            }
        }
    }

    /*       _____ _                   _                  
     *      / ____| |                 | |                 
     *     | (___ | |_ _ __ _   _  ___| |_ _   _ _ __ ___ 
     *      \___ \| __| '__| | | |/ __| __| | | | '__/ _ \
     *      ____) | |_| |  | |_| | (__| |_| |_| | | |  __/
     *     |_____/ \__|_|   \__,_|\___|\__|\__,_|_|  \___|*/

    /**Returns the Value of a key in the object */
    getKey<B extends keyof T>(key: B): T[B] {
        return this._value[key];
    }

    /**Sets the Value of a key in the object */
    setKey<B extends keyof T>(key: B, member: T[B]): T[B] {
        if (key in this._value) {
            if (member !== this._value[key]) {
                var removedMember = this._value[key];
                if (removedMember instanceof State) {
                    removedMember.unsubscribe(this._keylisteners[key]);
                }
                if (member instanceof State) {
                    member.subscribe(this._keylisteners[key]);
                }
                this._updateStructure({ removed: { [key]: removedMember }, added: { [key]: member } });
            }
        } else {
            if (member instanceof State) {
                member.subscribe((val) => {
                    this._updateSubValue(key, member, val);
                });
            }
            this._updateStructure({ added: { [key]: member } });
        }
        return member;
    }

    /**Deletes a key from the structure */
    deleteKey<B extends keyof T>(key: B): T[B] | undefined {
        if (key in this._value) {
            let member = this._value[key];
            if (member instanceof State) {
                member.unsubscribe(this._keylisteners[key]);
            }
            delete this._value[key];
            this._updateStructure({ removed: { [key]: member } });
            return member;
        }
        return
    }

    /**Merges an object or another StateObject into this one
     * @param override when set true, both objects have the same key, it will use the one from the merging object, otherwise it will keep its own*/
    mergeKeys(keys: Partial<T>, override?: boolean) {
        let count = 0;
        const update: Required<KeyUpdate> = { removed: {}, added: {} }
        for (const key in keys) {
            const member = keys[key];
            if (key in this._value) {
                if (override) {
                    const removedMember = this._value[key];
                    if (removedMember instanceof State) {
                        removedMember.unsubscribe(this._keylisteners[key]);
                    }
                    update.removed[<string>key] = removedMember;
                    if (member instanceof State) {
                        member.subscribe(this._keylisteners[key]);
                    }
                    update.added[<string>key] = member;
                } else {
                    continue;
                }
            } else {
                if (member instanceof State) {
                    member.subscribe((val) => {
                        this._updateSubValue(key, member, val);
                    });
                }
                update.added[<string>key] = member;
            }
            count++;
        }
        if (count) {
            this._updateStructure(update);
        }
    }

    /**This adds a function as a subscriber to the state objects structural changes*/
    addStructureListener(func: StateObjectStructureSubscriber): typeof func {
        this._structureSubscriber.push(func);
        return func;
    }

    /**This removes a function as a subscriber to the state objects structural changes*/
    removeStructureListener(func: StateObjectStructureSubscriber): typeof func {
        const index = this._structureSubscriber.indexOf(func);
        if (index != -1) {
            this._structureSubscriber.splice(index, 1);
        } else {
            console.warn('Structure subscriber not found with state');
        }
        return func;
    }

    /**Returns wether the state has subscribers for object structure, true means it has at least one subscriber*/
    get inUseStructure(): boolean {
        return this._structureSubscriber.length !== 0;
    }

    /**Returns wether the state has a specific object structure subscriber, true means it has that subscriber*/
    hasStructureListener(func: StateObjectStructureSubscriber): boolean {
        return this._structureSubscriber.indexOf(func) !== -1;
    }

    /** This calls all object structure subscribers with the structure change*/
    private _updateStructure(keys: KeyUpdate): void {
        for (let i = 0, m = this._structureSubscriber.length; i < m; i++) {
            try {
                this._structureSubscriber[i](keys);
            } catch (e) {
                console.warn('Failed while calling object structure subscribers ', e);
            }
        }
    }
}

let test = new StateObject({
    s1: new State(1),
    s2: 2
})

test.setKey('s2', 5);

test.mergeKeys({ s2: 1 })