import { Err, Ok, Result } from "@chocolatelib/result";
import { State, StateDerived, StateError, StateNumberLimits, StateResource } from "../src";


class testServer {
    value: number = 0;
    quality: number = 1;
    constructor() {
        setInterval(() => { this.value++ }, 100);
    }

    async fetch() {
        await new Promise((a) => { setTimeout(a, 90 + (Math.random() * 20)) });
        if (Math.random() + this.quality > 1) {
            return this.value;
        } else {
            throw "Connection lost";
        }
    }

    set connectionQuality(qual: number) {
        this.quality = qual;
    }
}

class test extends StateResource<number> {
    #server: testServer;
    #interval: ReturnType<typeof setInterval>;

    constructor(server: testServer) {
        super();
        this.#server = server;
    }

    get debounce(): number {
        return 10;
    }

    get timeout(): number {
        return 200;
    }

    get retention(): number {
        return 250;
    }

    async singleGet(self: this): Promise<Result<number, StateError>> {
        try {
            return Ok(await this.#server.fetch());
        } catch (e) {
            return Err({ code: "CL", reason: e });
        }
    }

    protected setupConnection(self: this): void {
        this.#interval = setInterval(async () => {
            try {
                self.updateResource(await this.#server.fetch());
            } catch (e) {
                self.updateResource(undefined, { code: "CL", reason: e });
            }
        }, 500);
    }

    protected teardownConnection(self: this): void {
        clearInterval(this.#interval);
    }

    write(value: number): void {

    }
}

let server = new testServer();
(window as any).server = server;

let client = new test(server);
(window as any).client = client;

let slider = document.createElement("input");
slider.type = 'range';
slider.min = "0";
slider.max = "1";
slider.step = "0.05";
slider.oninput = () => {
    server.quality = Number(slider.value);
}
document.body.appendChild(slider);

let singleGet = document.createElement("button");
singleGet.innerHTML = "Single Get";
singleGet.onclick = async () => {
    (await client).andThen<false>((value) => {
        singleGet.innerHTML = "Single Get " + String(value);
        return Ok(false);
    }).orElse((err) => {
        singleGet.innerHTML = "Single Get " + String(err.reason);
        return Ok(false);
    })
}
document.body.appendChild(singleGet);

let connect = document.createElement("button");
connect.innerHTML = "Connect";
let sub: (val: any, err: any) => void;
connect.onclick = () => {
    sub = client.subscribe((val, err) => {
        if (err) {
            connect.innerHTML = "Connect " + String(err.reason);
        } else {
            connect.innerHTML = "Connect " + String(val);
        }
    })
}
document.body.appendChild(connect);

let disconnect = document.createElement("button");
disconnect.innerHTML = "Disconnect";
disconnect.onclick = () => {
    client.unsubscribe(sub);
}
document.body.appendChild(disconnect);