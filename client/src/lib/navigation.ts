export const navigationOrder = [
  "cover",
  "map",
  "timeline",
  "land",
  "folk",
  "artifacts",
  "routes",
];

export function readNavigation(hash: string) {
  try {
    const [section, target] = hash.slice(1).split("/").map(decodeURIComponent);
    const valid = navigationOrder.includes(section);
    return {
      section: valid ? section : "cover",
      target: valid && section !== "cover" ? target || undefined : undefined,
      direction: 1,
      revision: 0,
    };
  } catch {
    return { section: "cover", target: undefined, direction: 1, revision: 0 };
  }
}

export function navigationHistoryState(previous: unknown) {
  return {
    ...(previous && typeof previous === "object" ? previous : {}),
    cultureNavigation: 1,
  };
}

export function getInitialNavigation(
  hash: string,
  loadType: string | undefined,
  state: unknown
) {
  const ownEntry =
    state &&
    typeof state === "object" &&
    "cultureNavigation" in state &&
    state.cultureNavigation === 1;
  // Fresh visits always start at the cover, even when an old link contains a chapter.
  const restore =
    ownEntry && (loadType === "reload" || loadType === "back_forward");
  return readNavigation(restore ? hash : "#cover");
}

export function getWelcomeUrl(href: string) {
  const url = new URL(href);
  url.hash = "cover";
  url.searchParams.delete("preview");
  url.searchParams.delete("v");
  return url.href;
}
