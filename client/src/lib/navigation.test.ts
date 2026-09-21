import { describe, it, expect } from "vitest";
import {
  getInitialNavigation,
  getWelcomeUrl,
  navigationHistoryState,
  readNavigation,
} from "./navigation";

describe("welcome entry", () => {
  it.each([
    "",
    "#cover",
    "#map",
    "#artifacts",
    "#artifacts/artifact-10",
    "#land/land-3",
    "#timeline",
    "#%bad",
  ])("starts a new visit at the cover for %s", hash => {
    expect(getInitialNavigation(hash, "navigate", null).section).toBe("cover");
    expect(
      getInitialNavigation(hash, "navigate", navigationHistoryState(null))
        .section
    ).toBe("cover");
  });
  it.each(["reload", "back_forward"])(
    "restores an in-site %s without restarting the cover",
    type => {
      expect(
        getInitialNavigation(
          "#artifacts/artifact-10",
          type,
          navigationHistoryState(null)
        )
      ).toMatchObject({ section: "artifacts", target: "artifact-10" });
      expect(getInitialNavigation("#artifacts", type, null).section).toBe(
        "cover"
      );
    }
  );
  it("does not depend on browser storage or a supported navigation timing API", () => {
    expect(getInitialNavigation("#land", undefined, null).section).toBe(
      "cover"
    );
  });
  it("keeps browser history data and valid chapter detail targets", () => {
    expect(navigationHistoryState({ key: "existing" })).toMatchObject({
      key: "existing",
      cultureNavigation: 1,
    });
    expect(readNavigation("#land/%E7%A7%A6%E6%B1%89")).toMatchObject({
      section: "land",
      target: "秦汉",
    });
    expect(readNavigation("#unknown/target")).toMatchObject({
      section: "cover",
      target: undefined,
    });
    expect(readNavigation("#%bad").section).toBe("cover");
  });
  it("returns retired solar-term links to the welcome page", () => {
    for (const hash of ["#solar", "#solar/s1"]) {
      expect(readNavigation(hash)).toMatchObject({
        section: "cover",
        target: undefined,
      });
      expect(
        getInitialNavigation(hash, "reload", navigationHistoryState(null))
          .section
      ).toBe("cover");
    }
  });
  it("shares the welcome page without old preview or version parameters", () => {
    expect(
      getWelcomeUrl(
        "https://asukaneko-39.github.io/-CSZ1-pages/?v=6adb32e&preview=smooth-zoom#artifacts/artifact-10"
      )
    ).toBe("https://asukaneko-39.github.io/-CSZ1-pages/#cover");
    expect(getWelcomeUrl("https://example.com/?access=example#land")).toBe(
      "https://example.com/?access=example#cover"
    );
  });
});
