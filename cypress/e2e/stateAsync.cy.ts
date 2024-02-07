/// <reference types="cypress" />
import { Err, Ok, Result, Some } from "@chocolatelib/result";
import { StateAsync, StateError, StateResult } from "../../src";

describe("Initial state", function () {
  it("Creating a state with initial error", async function () {
    let state = new StateAsync(Err({ reason: "Yo", code: "Yo" }));
    expect((await state).err).equal(true);
  });
  it("Creating a state with initial value", async function () {
    let state = new StateAsync(Ok(2));
    expect((await state).unwrap).equal(2);
  });
  it("Creating a state with initial promise", async function () {
    let time = performance.now();
    let state = new StateAsync(
      new Promise<StateResult<number>>((a) => {
        setTimeout(a, 250, Ok(2));
      })
    );
    state.subscribe((val) => {}, true);
    await new Promise((a) => {
      setTimeout(a, 250);
    });
    expect((await state).unwrap).equal(2);
    expect(performance.now()).above(time + 150);
    expect(performance.now()).below(time + 350);
    await new Promise((a) => {
      setTimeout(a, 250);
    });

    expect((await state).unwrap).equal(2);
  });
  it("Creating a state with promise function", async function () {
    let time = performance.now();
    let state = new StateAsync(() => {
      return new Promise<StateResult<number>>((a) => {
        setTimeout(a, 250, Ok(2));
      });
    });
    await new Promise((a) => {
      setTimeout(a, 250);
    });
    state.subscribe((val) => {}, true);
    expect((await state).unwrap).equal(2);
    expect(performance.now()).above(time + 350);
    expect(performance.now()).below(time + 600);
    await new Promise((a) => {
      setTimeout(a, 250);
    });
    expect((await state).unwrap).equal(2);
  });
});

describe("Setting state value", function () {
  it("From owner context", async function () {
    let state = new StateAsync(Ok(2));
    expect((await state).unwrap).equal(2);
    state.set(Ok(4));
    expect((await state).unwrap).equal(4);
  });
  it("From user context with no setter function", async function () {
    let state = new StateAsync(Ok(2));
    expect((await state).unwrap).equal(2);
    state.write(4);
    expect((await state).unwrap).equal(2);
  });
  it("From user context with standard setter function", async function () {
    let state = new StateAsync(Ok(2), true);
    expect((await state).unwrap).equal(2);
    state.set(Ok(4));
    expect((await state).unwrap).equal(4);
  });
  it("From user context with custom function", async function () {
    let state = new StateAsync(Ok(2), (val) => Some(Ok(val * 2)));
    expect((await state).unwrap).equal(2);
    state.write(4);
    expect((await state).unwrap).equal(8);
  });
});

describe("Getting state value", async function () {
  it("Using await", async function () {
    let state = new StateAsync(Ok(2));
    expect((await state).unwrap).equal(2);
  });
  it("Using then", function (done) {
    let state = new StateAsync(Ok(2));
    state.then((val) => {
      expect(val.unwrap).equal(2);
      done();
    });
  });
  it("Using then with chaining return", function (done) {
    let state = new StateAsync(Ok(2));
    state
      .then((val) => {
        expect(val.unwrap).equal(2);
        return 8;
      })
      .then((val) => {
        expect(val).equal(8);
        done();
      });
  });
  it("Using then with chaining throw", function (done) {
    let state = new StateAsync(Ok(2));
    state
      .then((val) => {
        expect(val.unwrap).equal(2);
        throw 8;
      })
      .then(
        () => {},
        (val) => {
          expect(val).equal(8);
          done();
        }
      );
  });
  it("Using then with async chaining return", function (done) {
    let state = new StateAsync(Ok(2));
    state
      .then(async (val) => {
        await new Promise((a) => {
          setTimeout(a, 10);
        });
        expect(val.unwrap).equal(2);
        return 8;
      })
      .then((val) => {
        expect(val).equal(8);
        done();
      });
  });
  it("Using then with async chaining throw", function (done) {
    let state = new StateAsync(Ok(2));
    state
      .then(async (val) => {
        await new Promise((a) => {
          setTimeout(a, 10);
        });
        expect(val.unwrap).equal(2);
        throw 8;
      })
      .then(
        () => {},
        (val) => {
          expect(val).equal(8);
          done();
        }
      );
  });
});

describe("Writing state value", async function () {
  it("Writing to state with error value", async function () {
    let state = new StateAsync(Err({ code: "Yo", reason: "Yo" }));
    state.write(2);
  });
});

describe("Value subscriber", function () {
  it("Add one subscribers with update set true", function () {
    let state = new StateAsync(Ok(2));
    state.subscribe((value) => {}, true);
  });
  it("Add one subscribers with update set true", function () {
    let state = new StateAsync(Ok(2));
    state.subscribe((value) => {
      expect(value).equal(2);
    }, true);
  });
  it("Add two subscribers with update set true", async function () {
    let state = new StateAsync(Ok(2));
    let values = await Promise.all([
      new Promise<Result<number, StateError>>((a) => {
        state.subscribe(a, true);
      }),
      new Promise<Result<number, StateError>>((a) => {
        state.subscribe(a, true);
      }),
    ]);
    expect(values).deep.equal([Ok(2), Ok(2)]);
  });
  it("Insert two subscribers then remove first subscribers", function (done) {
    let state = new StateAsync(Ok(2));
    let func = state.subscribe(() => {}, true);
    state.subscribe(() => {
      done();
    }, false);
    expect(state.inUse()).deep.equal(true);
    state.unsubscribe(func);
    expect(state.inUse()).deep.equal(true);
    state.set(Ok(4));
  });
  it("Insert two subscribers then removeing both subscribers", function (done) {
    let state = new StateAsync(Ok(2));
    let sum = 0;
    let func1 = state.subscribe(() => {
      done("Should not be called");
    }, false);
    let func2 = state.subscribe(() => {
      done("Should not be called");
    }, false);
    expect(state.inUse()).deep.equal(true);
    state.unsubscribe(func1);
    state.unsubscribe(func2);
    expect(state.inUse()).deep.equal(false);
    state.set(Ok(4));
    done();
  });
  it("Setting value with one subscribers", function (done) {
    let state = new StateAsync(Ok(2));
    state.subscribe((val) => {
      done();
    }, false);
    state.set(Ok(10));
  });
  it("Setting value with multiple subscribers", async function () {
    let state = new StateAsync(Ok(2));
    let sum = 0;
    state.subscribe((val) => {
      sum += val.unwrap;
    }, true);
    state.subscribe((val) => {
      sum += val.unwrap;
    }, true);
    state.subscribe((val) => {
      sum += val.unwrap;
    }, true);
    state.set(Ok(10));
    expect(sum).equal(36);
  });
  it("Setting value with subscribers with exception", function () {
    let state = new StateAsync(Ok(2));
    state.subscribe((val) => {
      throw false;
    }, false);
    state.set(Ok(10));
  });
});
