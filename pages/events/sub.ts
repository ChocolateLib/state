/**Event class
 * contains the needed data to dispatch an event*/
export class ESub<Type, Handler, Data>{
    /**Type of event */
    public readonly type: Type;
    /**Reference to */
    public readonly target: Handler;
    /**Path to sub event */
    public readonly sub?: SubPath;
    /**Data of event */
    public readonly data: Data;
    /**Any data to pass to the event listeners must be given in the constructor*/
    constructor(type: Type, target: Handler, data: Data, sub?: SubPath) {
        this.type = type;
        this.target = target;
        this.data = data;
        this.sub = sub;
    }
}

/**Listener function */
export interface ESubListener<Type, Handler, Data> {
    (event: ESub<Type, Handler, Data>): boolean | void;
}

/**Type for storage of listeners in event handler */
interface ListenerStorage<K, Handler, Type> {
    subs: { [key: string]: ListenerStorage<K, Handler, Type> },
    funcs: ESubListener<K, Handler, Type>[],
}


type SubPath = [string, ...string[]];

/**Performs type override */
type TargetOverride<Types extends {}, T> = T extends [never] ? EventHandlerSub<Types> : T


/**Extension to event handler with support for sub events*/
export class EventHandlerSub<Types extends {}, Target extends {} = [never]> {
    /**Override for target */
    target: Target | undefined
    /**Storage for sub event listeners*/
    private eventHandler_ListenerStorage: { [K in keyof Types]?: ListenerStorage<K, TargetOverride<Types, Target>, Types[K]> } = {}

    /**This add the listener to the event handler */
    on<K extends keyof Types>(type: K, listener: ESubListener<K, TargetOverride<Types, Target>, Types[K]>, sub?: SubPath) {
        let subLevel = this.eventHandler_ListenerStorage[type];
        if (!subLevel) {
            subLevel = this.eventHandler_ListenerStorage[type] = { subs: {}, funcs: [] };
        }
        if (sub) {
            for (let i = 0; i < sub.length; i++) {
                let subLevelBuffer = subLevel!.subs[sub[i]];
                if (subLevelBuffer) {
                    subLevel = subLevelBuffer;
                } else {
                    subLevel = subLevel!.subs[sub[i]] = { subs: {}, funcs: [] };
                }
            }
        }
        var typeListeners = subLevel!.funcs;
        let index = typeListeners.indexOf(listener);
        if (index == -1) {
            typeListeners.push(listener);
        } else {
            console.warn('Listener already in handler');
        }
        return listener;
    }

    /**This add the listener to the event handler which is automatically removed at first call */
    once<K extends keyof Types>(eventName: K, listener: ESubListener<K, TargetOverride<Types, Target>, Types[K]>, sub?: SubPath) {
        this.on(eventName, function (e) {
            listener(e);
            return true;
        }, sub);
        return listener;
    }

    /**This removes the listener from the event handler */
    off<K extends keyof Types>(type: K, listener: ESubListener<K, TargetOverride<Types, Target>, Types[K]>, sub?: SubPath) {
        var subLevel = this.eventHandler_ListenerStorage[type];
        if (subLevel) {
            if (sub) {
                for (let i = 0; i < sub.length; i++) {
                    let subLevelBuffer = subLevel!.subs[sub[i]];
                    if (subLevelBuffer) {
                        subLevel = subLevelBuffer;
                    } else {
                        console.warn('Listener not in handler');
                        return listener;
                    }
                }
            }
            var typeListeners = subLevel!.funcs;
            let index = typeListeners.indexOf(listener);
            if (index != -1) {
                typeListeners.splice(index, 1);
            } else {
                console.warn('Listener not in handler');
            }
        }
        return listener;
    }

    /**This dispatches the event, event data is frozen */
    emit<K extends keyof Types>(type: K, data: Types[K], sub?: SubPath) {
        if (sub) {
            var subLevel = this.eventHandler_ListenerStorage[type];
            if (subLevel) {
                for (let i = 0; i < sub.length; i++) {
                    let subLevelBuffer = subLevel!.subs[sub[i]];
                    if (subLevelBuffer) {
                        subLevel = subLevelBuffer;
                    } else {
                        return;
                    }
                }
            }
            var funcs = subLevel?.funcs;
        } else {
            var funcs = this.eventHandler_ListenerStorage[type]?.funcs;
        }
        if (funcs && funcs.length > 0) {
            //@ts-expect-error
            let event = Object.freeze(new ESub<K, TargetOverride<Types, Target>, Types[K]>(type, this.target || this, data, sub));
            if (funcs.length > 1) {
                funcs = [...funcs];
            }
            for (let i = 0, n = funcs.length; i < n; i++) {
                try {
                    if (funcs[i](event)) {
                        funcs.splice(i, 1);
                        n--;
                        i--;
                    }
                } catch (e) {
                    console.warn('Failed while dispatching event', e);
                }
            }
        }
    }

    /**This removes all listeners of a type from the event handler */
    clear<K extends keyof Types>(type: K, sub?: SubPath, anyLevel?: boolean) {
        let typeBuff = this.eventHandler_ListenerStorage[type];
        if (typeBuff) {
            if (anyLevel) {
                if (sub) {
                    let subLevel = typeBuff;
                    for (var i = 0; i < sub.length - 1; i++) {
                        let subLevelBuffer = subLevel!.subs[sub[i]];
                        if (subLevelBuffer) {
                            subLevel = subLevelBuffer;
                        } else {
                            return;
                        }
                    }
                    subLevel!.subs[sub[i]] = { subs: {}, funcs: [] };
                } else {
                    this.eventHandler_ListenerStorage[type] = { subs: {}, funcs: [] };
                }
            } else {
                if (sub) {
                    for (let i = 0; i < sub.length; i++) {
                        let subLevelBuffer = typeBuff!.subs[sub[i]];
                        if (subLevelBuffer) {
                            typeBuff = subLevelBuffer;
                        } else {
                            return;
                        }
                    }
                }
                typeBuff.funcs = [];
            }
        }
    }

    /**Returns wether the type has listeners, true means it has at least a listener */
    inUse<K extends keyof Types>(type: K, sub?: SubPath) {
        let typeBuff = this.eventHandler_ListenerStorage[type];
        if (typeBuff) {
            if (sub) {
                for (let i = 0; i < sub.length; i++) {
                    let subLevelBuffer = typeBuff!.subs[sub[i]];
                    if (subLevelBuffer) {
                        typeBuff = subLevelBuffer;
                    } else {
                        return false;
                    }
                }
            }
            return Boolean(typeBuff.funcs.length);
        } else {
            return false;
        }
    }

    /**Returns wether the type has a specific listeners, true means it has that listener */
    has<K extends keyof Types>(type: K, listener: ESubListener<K, TargetOverride<Types, Target>, Types[K]>, sub?: SubPath) {
        let typeBuff = this.eventHandler_ListenerStorage[type];
        if (typeBuff) {
            if (sub) {
                for (let i = 0; i < sub.length; i++) {
                    let subLevelBuffer = typeBuff!.subs[sub[i]];
                    if (subLevelBuffer) {
                        typeBuff = subLevelBuffer;
                    } else {
                        return false;
                    }
                }
            }
            return Boolean(typeBuff.funcs.indexOf(listener) !== -1);
        } else {
            return false;
        }
    }

    /**Returns the amount of listeners on that event */
    amount<K extends keyof Types>(type: K, sub?: SubPath) {
        let typeBuff = this.eventHandler_ListenerStorage[type];
        if (typeBuff) {
            if (sub) {
                for (let i = 0; i < sub.length; i++) {
                    let subLevelBuffer = typeBuff!.subs[sub[i]];
                    if (subLevelBuffer) {
                        typeBuff = subLevelBuffer;
                    } else {
                        return false;
                    }
                }
            }
            return typeBuff.funcs.length;
        } else {
            return 0;
        }
    }

    /**Returns the eventhandler with only the event user methods */
    get eventsUserOnly(): EventHandlerSubUserOnly<Types, Target> {
        return this
    }
}

export interface EventHandlerSubUserOnly<Types extends {}, Target> {
    on<K extends keyof Types>(eventName: K, listener: ESubListener<K, TargetOverride<Types, Target>, Types[K]>): ESubListener<K, TargetOverride<Types, Target>, Types[K]>
    once<K extends keyof Types>(eventName: K, listener: ESubListener<K, TargetOverride<Types, Target>, Types[K]>): ESubListener<K, TargetOverride<Types, Target>, Types[K]>
    off<K extends keyof Types>(eventName: K, listener: ESubListener<K, TargetOverride<Types, Target>, Types[K]>): ESubListener<K, TargetOverride<Types, Target>, Types[K]>
}