/**Event class
 * contains the needed data to dispatch an event*/
export class E<Type, Handler, Data>{
    /**Type of event */
    public readonly type: Type;
    /**Reference to */
    public readonly target: Handler;
    /**Data of event */
    public readonly data: Data;
    /**Any data to pass to the event listeners must be given in the constructor*/
    constructor(type: Type, target: Handler, data: Data) {
        this.type = type;
        this.target = target;
        this.data = data;
    }
}

/**Listener function */
export interface EListener<Type, Handler, Data> {
    (event: E<Type, Handler, Data>): boolean | void;
}

/**Performs type override */
type TargetOverride<Types extends {}, T> = T extends [never] ? EventHandler<Types> : T

/*Simple event handler class
should always be added as a property of another object*/
export class EventHandler<Types extends {}, Target extends {} = [never]> {
    /**Override for target */
    target: Target | undefined
    /**Storage for event listeners*/
    private eventHandler_ListenerStorage: { [K in keyof Types]?: EListener<K, TargetOverride<Types, Target>, Types[K]>[] } = {}

    /**This add the listener to the event handler*/
    on<K extends keyof Types>(eventName: K, listener: EListener<K, TargetOverride<Types, Target>, Types[K]>) {
        let typeListeners = this.eventHandler_ListenerStorage[eventName];
        if (typeListeners) {
            let index = typeListeners.indexOf(listener);
            if (index == -1) {
                typeListeners.push(listener);
            } else {
                console.warn('Listener already in handler');
            }
        } else {
            this.eventHandler_ListenerStorage[eventName] = [listener];
        }
        return listener;
    }

    /**This add the listener to the event handler which is automatically removed at first call*/
    once<K extends keyof Types>(eventName: K, listener: EListener<K, TargetOverride<Types, Target>, Types[K]>) {
        this.on(eventName, function (e) {
            listener(e);
            return true;
        });
        return listener;
    }

    /**This removes the listener from the event handler*/
    off<K extends keyof Types>(eventName: K, listener: EListener<K, TargetOverride<Types, Target>, Types[K]>) {
        let typeListeners = this.eventHandler_ListenerStorage[eventName];
        if (typeListeners) {
            let index = typeListeners.indexOf(listener);
            if (index != -1) {
                typeListeners.splice(index, 1);
            } else {
                console.warn('Listener not in handler');
            }
        }
        return listener;
    }

    /**This dispatches the event, event data is frozen*/
    emit<K extends keyof Types>(eventName: K, data: Types[K]) {
        let funcs = this.eventHandler_ListenerStorage[eventName];
        if (funcs && funcs.length > 0) {
            //@ts-expect-error
            let event = Object.freeze(new E<K, TargetOverride<Types, Target>, Types[K]>(eventName, this.target || this, data));
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

    /**This removes all listeners of a type from the event handler*/
    clear<K extends keyof Types>(eventName: K) {
        this.eventHandler_ListenerStorage[eventName] = [];
    }

    /**Returns wether the type has listeners, true means it has at least a listener*/
    inUse<K extends keyof Types>(eventName: K) {
        return Boolean(this.eventHandler_ListenerStorage[eventName]?.length);
    }

    /**Returns wether the type has a specific listeners, true means it has that listener*/
    has<K extends keyof Types>(eventName: K, listener: EListener<K, TargetOverride<Types, Target>, Types[K]>) {
        return Boolean(this.eventHandler_ListenerStorage[eventName]?.indexOf(listener) !== -1);
    }

    /**Returns the amount of listeners on that event*/
    amount<K extends keyof Types>(eventName: K) {
        return this.eventHandler_ListenerStorage[eventName]?.length || 0;
    }

    /**Returns the eventhandler with only the event user methods */
    get eventsUserOnly(): EventHandlerUserOnly<Types, Target> {
        return this
    }
}

export interface EventHandlerUserOnly<Types extends {}, Target> {
    on<K extends keyof Types>(eventName: K, listener: EListener<K, TargetOverride<Types, Target>, Types[K]>): EListener<K, TargetOverride<Types, Target>, Types[K]>
    once<K extends keyof Types>(eventName: K, listener: EListener<K, TargetOverride<Types, Target>, Types[K]>): EListener<K, TargetOverride<Types, Target>, Types[K]>
    off<K extends keyof Types>(eventName: K, listener: EListener<K, TargetOverride<Types, Target>, Types[K]>): EListener<K, TargetOverride<Types, Target>, Types[K]>
}