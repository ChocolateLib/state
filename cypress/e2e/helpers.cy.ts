/// <reference types="cypress" />
import { Err, Ok, Result, Some } from "@chocolatelib/result";
import {
  State,
  StateNumberHelper,
  StateRead,
  StateStringHelper,
} from "../../src";

describe("State Number Min Max", function () {
  it("Checking limiter min max", function () {
    let state = new State<number>(Ok(5), true, new StateNumberHelper(0, 10));
    expect(state.get().unwrap).to.equal(5);
    expect(state.limit(11).unwrap).to.equal(10);
    expect(state.limit(-11).unwrap).to.equal(0);
    state.write(11);
    expect(state.get().unwrap).to.equal(10);
    state.write(-11);
    expect(state.get().unwrap).to.equal(0);
  });
  it("Checking checker min max", function () {
    let state = new State<number>(Ok(5), true, new StateNumberHelper(0, 10));
    expect(state.get().unwrap).to.equal(5);
    expect(state.check(11).unwrap).to.equal(
      "11 is bigger than the limit of 10"
    );
    expect(state.check(-11).unwrap).to.equal(
      "-11 is smaller than the limit of 10"
    );
  });
  it("Checking related min max", function () {
    let state = new State(Ok(5), true, new StateNumberHelper(0, 10));
    let related = state.related().unwrap;
    expect(related.min).to.equal(0);
    expect(related.max).to.equal(10);
  });
});
describe("State Number Unit", function () {
  it("Checking related unit", function () {
    let state = new State(
      Ok(5),
      true,
      new StateNumberHelper(undefined, undefined, "test")
    );
    let related = state.related().unwrap;
    expect(related.unit).to.equal("test");
  });
});
describe("State Number decimals", function () {
  it("Checking related decimals", function () {
    let state = new State(
      Ok(5),
      true,
      new StateNumberHelper(undefined, undefined, undefined, 2)
    );
    let related = state.related().unwrap;
    expect(related.decimals).to.equal(2);
  });
  it("Checking limiter decimals step", function () {
    let state = new State<number>(
      Ok(5),
      true,
      new StateNumberHelper(undefined, undefined, undefined, 1, 0.13)
    );
    expect(state.get().unwrap).to.equal(5);
    expect(state.limit(11).unwrap).to.equal(11.1);
    expect(state.limit(-11).unwrap).to.equal(-11.1);
    state.write(11);
    expect(state.get().unwrap).to.equal(11.1);
    state.write(-11);
    expect(state.get().unwrap).to.equal(-11.1);
  });
  it("Checking limiter decimals step start", function () {
    let state = new State<number>(
      Ok(5),
      true,
      new StateNumberHelper(undefined, undefined, undefined, 3, 0.003, 0.07)
    );
    expect(state.get().unwrap).to.equal(5);
    expect(state.limit(11).unwrap).to.equal(10.999);
    expect(state.limit(-11).unwrap).to.equal(-11);
    state.write(11);
    expect(state.get().unwrap).to.equal(10.999);
    state.write(-11);
    expect(state.get().unwrap).to.equal(-11);
  });
});
describe("State Number step start", function () {
  it("Checking limiter step", function () {
    let state = new State<number>(
      Ok(5),
      true,
      new StateNumberHelper(undefined, undefined, undefined, undefined, 0.13)
    );
    expect(state.get().unwrap).to.equal(5);
    expect(state.limit(11).unwrap).to.equal(11.05);
    expect(state.limit(-11).unwrap).to.equal(-11.05);
    state.write(11);
    expect(state.get().unwrap).to.equal(11.05);
    state.write(-11);
    expect(state.get().unwrap).to.equal(-11.05);
  });
  it("Checking limiter step start", function () {
    let state = new State<number>(
      Ok(5),
      true,
      new StateNumberHelper(
        undefined,
        undefined,
        undefined,
        undefined,
        0.13,
        0.02
      )
    );
    expect(state.get().unwrap).to.equal(5);
    expect(state.limit(11).unwrap).to.equal(10.94);
    expect(state.limit(-11).unwrap).to.equal(-11.03);
    state.write(11);
    expect(state.get().unwrap).to.equal(10.94);
    state.write(-11);
    expect(state.get().unwrap).to.equal(-11.03);
  });
});

describe("State String Max Len", function () {
  it("Checking limiter max len", function () {
    let state = new State<string>(Ok("5"), true, new StateStringHelper(10));
    expect(state.get().unwrap).to.equal("5");
    expect(state.limit("12345678901").unwrap).to.equal("1234567890");
    state.write("12345678901");
    expect(state.get().unwrap).to.equal("1234567890");
  });
  it("Checking checker max len", function () {
    let state = new State<string>(Ok("5"), true, new StateStringHelper(10));
    expect(state.get().unwrap).to.equal("5");
    expect(state.check("12345678901").unwrap).to.equal(
      "the text is longer than the limit of 10 characters"
    );
  });
  it("Checking related max len", function () {
    let state = new State(Ok("5"), true, new StateStringHelper(10));
    let related = state.related().unwrap;
    expect(related.maxLength).to.equal(10);
  });
});

describe("State String Max Byte Len", function () {
  it("Checking limiter max byte len", function () {
    let state = new State<string>(
      Ok("5"),
      true,
      new StateStringHelper(undefined, 10)
    );
    expect(state.get().unwrap).to.equal("5");
    expect(state.limit("1æøåæ01").unwrap).to.equal("1æøåæ0");
    state.write("1æøåæ01");
    expect(state.get().unwrap).to.equal("1æøåæ0");
  });
  it("Checking checker max byte len", function () {
    let state = new State<string>(
      Ok("5"),
      true,
      new StateStringHelper(undefined, 10)
    );
    expect(state.get().unwrap).to.equal("5");
    expect(state.check("1æøåæ01").unwrap).to.equal(
      "the text is longer than the limit of 10 bytes"
    );
  });
  it("Checking related max byte len", function () {
    let state = new State(Ok("5"), true, new StateStringHelper(undefined, 10));
    let related = state.related().unwrap;
    expect(related.maxLengthBytes).to.equal(10);
  });
});
