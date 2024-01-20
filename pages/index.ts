import { Err, Ok, Result } from "@chocolatelib/result";
import {
  State,
  StateDerived,
  StateError,
  StateResource,
  StateResult,
  StateSummer,
} from "../src";

let state = new State(Ok(1));
state.write(5);

class StateResourceTestServer {
  value: number = 0;
  quality: number = 1;
  constructor() {
    setInterval(() => {
      this.value++;
    }, 100);
  }

  async fetch() {
    await new Promise((a) => {
      setTimeout(a, 90 + Math.random() * 20);
    });
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

class StateResourceTestClient extends StateResource<number> {
  #server: StateResourceTestServer;
  #interval: ReturnType<typeof setInterval>;

  constructor(server: StateResourceTestServer) {
    super();
    this.#server = server;
  }

  get debounce(): number {
    return 10;
  }

  get timeout(): number {
    return 2000;
  }

  get retention(): number {
    return 250;
  }

  async singleGet(): Promise<Result<number, StateError>> {
    try {
      return Ok(await this.#server.fetch());
    } catch (e) {
      return Err({ code: "CL", reason: e });
    }
  }

  protected setupConnection(
    update: (value: StateResult<number>) => void
  ): void {
    this.#interval = setInterval(async () => {
      try {
        update(Ok(await this.#server.fetch()));
      } catch (e) {
        update(Err({ code: "CL", reason: e }));
      }
    }, 500);
  }

  protected teardownConnection(): void {
    clearInterval(this.#interval);
  }

  write(value: number): void {}
}

let server = new StateResourceTestServer();
(window as any).server = server;

let client = new StateResourceTestClient(server);
(window as any).client = client;

let slider = document.createElement("input");
slider.type = "range";
slider.min = "0";
slider.max = "1";
slider.step = "0.05";
slider.oninput = () => {
  server.quality = Number(slider.value);
};
document.body.appendChild(slider);

let singleGet = document.createElement("button");
singleGet.innerHTML = "Single Get";
singleGet.onclick = async () => {
  let test = await client;
  test
    .andThen<false>((value) => {
      singleGet.innerHTML = "Single Get " + String(value);
      return Ok(false);
    })
    .orElse((err) => {
      singleGet.innerHTML = "Single Get " + String(err.reason);
      return Ok(false);
    });
};
document.body.appendChild(singleGet);

let connect = document.createElement("button");
connect.innerHTML = "Connect";
let sub: (val: Result<number, StateError>) => void;
connect.onclick = () => {
  sub = client.subscribe((val) => {
    if (val.err) {
      connect.innerHTML = "Connect " + String(val.error.reason);
    } else {
      connect.innerHTML = "Connect " + String(val.value);
    }
  });
};
document.body.appendChild(connect);

let disconnect = document.createElement("button");
disconnect.innerHTML = "Disconnect";
disconnect.onclick = () => {
  client.unsubscribe(sub);
};
document.body.appendChild(disconnect);

let derived1 = new State(Ok(1));
let derived2 = new State(Ok(2));
let derived3 = new State(Ok(3));
let derived = new StateSummer(derived1, derived2, derived3);

let derived1Input = document.createElement("input");
derived1Input.type = "number";
derived1.subscribe((val) => {
  derived1Input.valueAsNumber = val.unwrap;
}, true);
derived1Input.onchange = () => {
  derived1.set(Ok(derived1Input.valueAsNumber));
};
document.body.appendChild(derived1Input);

let derivedConnect = document.createElement("button");
derivedConnect.innerHTML = "Derived Connect";
let derivedSub: (val: Result<number, StateError>) => void;
derivedConnect.onclick = () => {
  derivedSub = derived.subscribe((val) => {
    if (val.err) {
      derivedConnect.innerHTML = "Derived Connect " + String(val.error.reason);
    } else {
      derivedConnect.innerHTML = "Derived Connect " + String(val.value);
    }
  });
};
document.body.appendChild(derivedConnect);

let derivedDisconnect = document.createElement("button");
derivedDisconnect.innerHTML = "Derived Disconnect";
derivedDisconnect.onclick = () => {
  derived.unsubscribe(derivedSub);
};
document.body.appendChild(derivedDisconnect);
