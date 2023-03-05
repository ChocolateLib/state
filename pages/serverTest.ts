import { StateWriteable, StateAsync, StateInfo, StateOptions } from "../src";

export class StateServer {
    private _value: number;
    connnected: boolean = true;
    constructor(value: number) {
        this._value = value;
        setInterval(() => { this._value++ }, 100)
    }

    private _clients: [] = [];

    async getValue() {
        if (this.connnected) {
            await new Promise((a) => { setTimeout(a, 100) });
            return this._value;
        } else {
            throw new Error;
        }
    }

    async setValue(value: number) {
        if (this.connnected) {
            await new Promise((a) => { setTimeout(a, 100) });
            this._value = value;
        }
    }

}

export class StateClient extends StateAsync<number> {
    private _server: StateServer;
    private _interval: NodeJS.Timeout;

    constructor(server: StateServer, options?: StateOptions) {
        super(
            async () => {
                this._interval = setInterval(async () => {
                    try {
                        this.asyncFulfill = await this._server.getValue();
                    } catch (error) {
                        this.asyncReject = error;
                    }
                }, 500);
            },
            async () => {
                clearInterval(this._interval)
            }, async () => {
                try {
                    this.asyncFulfill = await this._server.getValue();
                } catch (error) {
                    this.asyncReject = error;
                }
            },
            (val) => {
                try {
                    this._server.setValue(val);
                } catch (error) { }
            },
            5,
            options
        )
        this._server = server;
    }
}