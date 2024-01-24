/// <reference types="cypress" />
import { Ok } from "@chocolatelib/result";
import { StateDerived, State } from "../../src";

describe("Getting value", function () {
  it("Getting value from StateDerived with no States", async function () {
    let derived = new StateDerived();
    expect((await derived).err).equal(true);
  });
  it("Getting value from StateDerived with one state without function", async function () {
    let state1 = new State(Ok(5));
    let derived = new StateDerived(state1);
    expect((await derived).unwrap).equal(5);
  });
  it("Getting value from StateDerived with two states without function", async function () {
    let state1 = new State(Ok(5));
    let derived = new StateDerived(state1);
    expect((await derived).unwrap).equal(5);
  });
  it("Getting value from StateDerived with state with read function set", async function () {
    let state1 = new State(Ok(5));
    let state2 = new State(Ok(6));
    let derived = new StateDerived(
      ([a, b]) => {
        return Ok(a.unwrap * b.unwrap);
      },
      state1,
      state2
    );
    expect((await derived).unwrap).equal(30);
  });
});

describe("Subscribers", function () {
  it("If a subscriber is added to a StateDerived, it start listening to all States", function (done) {
    let state1 = new State(Ok(1));
    let state2 = new State(Ok(2));
    let state3 = new State(Ok(3));
    let derived = new StateDerived(state1, state2, state3);
    derived.subscribe((value) => {
      expect(value.unwrap).equal(1);
      done();
    }, true);
  });
  it("If a subscriber is added to a StateDerived, it start listening to all States", function (done) {
    let state1 = new State(Ok(1));
    let state2 = new State(Ok(2));
    let state3 = new State(Ok(3));
    let derived = new StateDerived(state1, state2, state3);
    derived.subscribe((val) => {
      expect(val.unwrap).equal(2);
      done();
    });
    state1.set(Ok(2));
    state2.set(Ok(3));
    state3.set(Ok(4));
  });
  it("If a subscriber is added to a StateDerived then removed, the States should not have listeners", function () {
    let state1 = new State(Ok(1));
    let state2 = new State(Ok(2));
    let state3 = new State(Ok(3));
    let derived = new StateDerived(state1, state2, state3);
    let func = derived.subscribe(() => {});
    derived.unsubscribe(func);
  });
  it("should not notify unsubscribed listeners when state changes", function (done) {
    let state1 = new State(Ok(1));
    let state2 = new State(Ok(2));
    let state3 = new State(Ok(3));
    let derived = new StateDerived(state1, state2, state3);
    let func = derived.subscribe(() => {
      done(new Error("This should not be called"));
    });
    derived.unsubscribe(func);
    state1.set(Ok(2));
    setTimeout(done, 1000); // Wait to see if the callback is called
  });

  it("should continue to notify other subscribers after one is removed", function (done) {
    let state1 = new State(Ok(1));
    let state2 = new State(Ok(2));
    let state3 = new State(Ok(3));
    let derived = new StateDerived(state1, state2, state3);
    let func1 = derived.subscribe(() => {
      done(new Error("This should not be called"));
    });
    derived.subscribe((val) => {
      expect(val.unwrap).equal(2);
      done();
    });
    derived.unsubscribe(func1);
    state1.set(Ok(2));
  });

  it("Subscriber is called when update flag is set true and a single state is used", function (done) {
    let state1 = new State(Ok(5));
    let derived = new StateDerived(state1);
    derived.subscribe((value) => {
      expect(value.unwrap).equal(5);
      done();
    }, true);
  });
});

describe("Error Scenarios", function () {
  it("If an array is passed to the StateDerived, and the array is modified, the StateDerived shall not be affected", async function () {
    let state1 = new State(Ok(1));
    let state2 = new State(Ok(2));
    let state3 = new State(Ok(3));
    let state4 = new State(Ok(4));
    let States = [state1, state2, state3];
    let derived = new StateDerived(...States);
    expect((await derived).unwrap).equal(1);
    States.unshift(state4);
    expect((await derived).unwrap).equal(1);
    States.shift();
    expect((await derived).unwrap).equal(1);
  });
});
