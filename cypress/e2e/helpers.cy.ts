/// <reference types="cypress" />
import { Err, Ok, Result, Some } from "@chocolatelib/result";
import {
  State,
  StateEnumLimits,
  StateEnumList,
  StateEnumRelated,
  StateRead,
} from "../../src";

describe("State Enum", function () {
  it("Creating a state with initial error", async function () {
    const enum ScrollbarModes {
      THIN = "thin",
      MEDIUM = "medium",
      WIDE = "wide",
    }
    const scrollbarModesInternal = {
      [ScrollbarModes.THIN]: {
        name: "Thin",
        description: "Thin modern scrollbar",
      },
      [ScrollbarModes.MEDIUM]: {
        name: "Medium",
        description: "Normal scrollbar",
      },
      [ScrollbarModes.WIDE]: {
        name: "Wide",
        description: "Large touch friendly scrollbar",
      },
    } as StateEnumList;

    const scrollbarModes = new State(
      Ok(scrollbarModesInternal)
    ) as StateRead<StateEnumList>;
    const scrollbarModesLimiter = new StateEnumLimits<ScrollbarModes>(
      scrollbarModesInternal
    );

    const scrollBarMode = new State<
      ScrollbarModes,
      ScrollbarModes,
      StateEnumRelated
    >(Ok(ScrollbarModes.THIN), true, scrollbarModesLimiter, () => {
      return Some({ list: scrollbarModes });
    });

    expect((await scrollBarMode).unwrap).to.equal(ScrollbarModes.THIN);
    scrollBarMode.write(ScrollbarModes.MEDIUM);
    expect((await scrollBarMode).unwrap).to.equal(ScrollbarModes.MEDIUM);
  });
});
