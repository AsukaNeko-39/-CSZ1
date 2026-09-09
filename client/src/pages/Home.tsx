import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import CulturePageTransition from "@/components/CulturePageTransition";
import Header from "@/components/Header";
import HunanMap from "@/components/HunanMap";
import LayerPanel from "@/components/LayerPanel";
import PointDetail from "@/components/PointDetail";
import BottomModules from "@/components/BottomModules";
import Footer from "@/components/Footer";
import { chapters } from "@/components/CultureScenery";
import {
  culturePoints,
  themeRoutes,
  type CulturePoint,
  type ThemeRoute,
} from "@/data/points";
import { landItems, folkItems, introCopy } from "@/data/catalog";
import { toast } from "sonner";
import ArtifactsPage from "./ArtifactsPage";
import TimelinePage from "./TimelinePage";
import RoutesPage from "./RoutesPage";
import SolarTermsPage from "./SolarTermsPage";
import CoverPage from "./CoverPage";
import CatalogPage from "./CatalogPage";
import { isCompactViewport, useCompactLayout } from "@/hooks/useCompactLayout";

const order = [
  "cover",
  "map",
  "timeline",
  "land",
  "folk",
  "artifacts",
  "routes",
  "solar",
];
function readNavigation() {
  try {
    const [section, target] = window.location.hash
      .slice(1)
      .split("/")
      .map(decodeURIComponent);
    return {
      section: order.includes(section) ? section : "cover",
      target: target || undefined,
      direction: 1,
      revision: 0,
    };
  } catch {
    return { section: "cover", target: undefined, direction: 1, revision: 0 };
  }
}

export default function Home() {
  const isCompactLayout = useCompactLayout();
  const [navigation, setNavigation] = useState(readNavigation);
  const activeNav = navigation.section;
  const scrollArea = useRef<HTMLDivElement>(null);
  const scrollPositions = useRef<Record<string, number>>({});
  const attachScrollArea = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node) return;
      scrollArea.current = node;
      if (!navigation.target) {
        node.scrollTo({
          top: scrollPositions.current[activeNav] || 0,
          behavior: "instant",
        });
      }
    },
    [activeNav, navigation.target]
  );
  const [selectedPoint, setSelectedPoint] = useState<CulturePoint | null>(() =>
    isCompactViewport() ? null : culturePoints[0]
  );
  const [focusRequest, setFocusRequest] = useState<{
    pointId: string;
    nonce: number;
  } | null>(null);
  const [activeRouteId, setActiveRouteId] = useState<ThemeRoute["id"] | null>(
    null
  );
  const [activeRouteStopId, setActiveRouteStopId] = useState<string | null>(
    null
  );
  const [visibleLayers, setVisibleLayers] = useState({
    ancient: true,
    modern: true,
    red: true,
  });

  const handleNavChange = useCallback(
    (section: string, target?: string) => {
      if (
        !order.includes(section) ||
        (section === activeNav && target === navigation.target)
      )
        return;
      scrollPositions.current[activeNav] = scrollArea.current?.scrollTop || 0;
      setNavigation(previous => ({
        section,
        target,
        revision: previous.revision + 1,
        direction:
          order.indexOf(section) >= order.indexOf(previous.section) ? 1 : -1,
      }));
      const url = new URL(window.location.href);
      url.hash = section + (target ? "/" + encodeURIComponent(target) : "");
      if (url.href !== window.location.href)
        window.history.pushState(null, "", url);
    },
    [activeNav, navigation.target]
  );

  useEffect(() => {
    const restore = () => {
      scrollPositions.current[activeNav] = scrollArea.current?.scrollTop || 0;
      setNavigation(previous => {
        const next = readNavigation();
        if (
          next.section === previous.section &&
          next.target === previous.target
        )
          return previous;
        return {
          ...next,
          revision: previous.revision + 1,
          direction:
            order.indexOf(next.section) >= order.indexOf(previous.section)
              ? 1
              : -1,
        };
      });
    };
    window.addEventListener("popstate", restore);
    window.addEventListener("hashchange", restore);
    return () => {
      window.removeEventListener("popstate", restore);
      window.removeEventListener("hashchange", restore);
    };
  }, [activeNav]);

  const activeRoute = useMemo(
    () => themeRoutes.find(route => route.id === activeRouteId) || null,
    [activeRouteId]
  );
  const activeRoutePoints = useMemo(
    () =>
      activeRoute
        ? activeRoute.points.flatMap(id => {
            const point = culturePoints.find(p => p.id === id);
            return point ? [point] : [];
          })
        : [],
    [activeRoute]
  );
  const filteredPoints = useMemo(
    () => culturePoints.filter(point => visibleLayers[point.category]),
    [visibleLayers]
  );
  const clearActiveRoute = useCallback(() => {
    setActiveRouteId(null);
    setActiveRouteStopId(null);
  }, []);
  const clearSelection = useCallback(() => {
    setSelectedPoint(null);
    setFocusRequest(null);
  }, []);
  const focusPoint = useCallback(
    (point: CulturePoint) => {
      clearActiveRoute();
      setSelectedPoint(point);
      setFocusRequest(previous => ({
        pointId: point.id,
        nonce: (previous?.nonce || 0) + 1,
      }));
    },
    [clearActiveRoute]
  );
  const handleLayerToggle = useCallback(
    (layer: "ancient" | "modern" | "red") => {
      const hiding = visibleLayers[layer];
      setVisibleLayers(previous => ({
        ...previous,
        [layer]: !previous[layer],
      }));
      if (hiding && selectedPoint?.category === layer) clearSelection();
    },
    [visibleLayers, selectedPoint, clearSelection]
  );
  const previousCompactLayout = useRef(isCompactLayout);
  useEffect(() => {
    if (isCompactLayout && !previousCompactLayout.current) clearSelection();
    previousCompactLayout.current = isCompactLayout;
  }, [isCompactLayout, clearSelection]);
  const handlePointJump = useCallback(
    (id: string) => {
      const point = culturePoints.find(p => p.id === id);
      if (!point) return;
      setVisibleLayers(previous => ({ ...previous, [point.category]: true }));
      handleNavChange("map");
      focusPoint(point);
    },
    [handleNavChange, focusPoint]
  );
  const handleSearch = useCallback(
    (query: string) => {
      if (!query.trim()) return;
      const point = culturePoints.find(
        p =>
          p.name.includes(query.trim()) ||
          p.tags.some(tag => tag.includes(query.trim()))
      );
      if (point) handlePointJump(point.id);
      else toast("未找到匹配的点位", { description: "请尝试其他关键词" });
    },
    [handlePointJump]
  );
  const handleClear = useCallback(() => {
    setVisibleLayers({ ancient: true, modern: true, red: true });
    clearActiveRoute();
    clearSelection();
  }, [clearActiveRoute, clearSelection]);
  const stepPoint = (direction: number) => {
    if (!selectedPoint || !filteredPoints.length) return;
    const index = filteredPoints.findIndex(
      point => point.id === selectedPoint.id
    );
    focusPoint(
      filteredPoints[
        (index + direction + filteredPoints.length) % filteredPoints.length
      ]
    );
  };
  const handleRouteSelect = useCallback(
    (id: string, pointId?: string) => {
      const route = themeRoutes.find(r => r.id === id);
      if (!route) return;
      const points = culturePoints.filter(p => route.points.includes(p.id));
      setVisibleLayers(previous => ({
        ancient: previous.ancient || points.some(p => p.category === "ancient"),
        modern: previous.modern || points.some(p => p.category === "modern"),
        red: previous.red || points.some(p => p.category === "red"),
      }));
      clearSelection();
      setActiveRouteId(route.id);
      setActiveRouteStopId(pointId || null);
      handleNavChange("map");
    },
    [clearSelection, handleNavChange]
  );
  const backToMap = () => handleNavChange("map");
  const currentName =
    chapters.find(chapter => chapter.id === activeNav)?.name ||
    (activeNav === "routes"
      ? "主题线路"
      : activeNav === "solar"
        ? "二十四节气"
        : "封面");

  return (
    <div className="culture-app h-[100dvh] min-h-[100svh] flex flex-col overflow-hidden">
      {activeNav !== "cover" && (
        <Header
          activeNav={activeNav === "solar" ? "folk" : activeNav}
          onNavChange={handleNavChange}
          onSearch={handleSearch}
        />
      )}
      <CulturePageTransition
        onCurrentRef={attachScrollArea}
        scene={{
          id: `${activeNav}:${navigation.target || ""}:${navigation.revision}`,
          section: activeNav,
          label: currentName,
          direction: navigation.direction,
          children: (
            <>
              {activeNav === "cover" && <CoverPage onEnter={backToMap} />}
              {activeNav === "map" && (
                <>
                  <main className="relative flex-1 min-h-0 overflow-hidden">
                    <HunanMap
                      points={filteredPoints}
                      selectedPoint={selectedPoint}
                      focusRequest={focusRequest}
                      onPointSelect={focusPoint}
                      visibleLayers={visibleLayers}
                      activeRoute={activeRoute}
                      routePoints={activeRoutePoints}
                      activeRouteStopId={activeRouteStopId}
                      onRouteStopSelect={id => {
                        clearSelection();
                        setActiveRouteStopId(id);
                      }}
                      onRouteExit={clearActiveRoute}
                    />
                    <LayerPanel
                      visibleLayers={visibleLayers}
                      onLayerToggle={handleLayerToggle}
                      onSearch={handleSearch}
                      onClear={handleClear}
                    />
                    <PointDetail
                      point={selectedPoint}
                      onClose={clearSelection}
                      onPrev={() => stepPoint(-1)}
                      onNext={() => stepPoint(1)}
                    />
                  </main>
                  <BottomModules
                    onNavigate={handleNavChange}
                    onRouteSelect={handleRouteSelect}
                  />
                  <Footer />
                </>
              )}
              {(activeNav === "land" || activeNav === "folk") && (
                <CatalogPage
                  title={activeNav === "land" ? "土地制度" : "民俗文化"}
                  introduction={introCopy[activeNav]}
                  items={activeNav === "land" ? landItems : folkItems}
                  kind={activeNav}
                  onBack={backToMap}
                  onNavigate={handleNavChange}
                  initialTarget={navigation.target}
                />
              )}
              {activeNav === "artifacts" && (
                <ArtifactsPage
                  onBack={backToMap}
                  onNavigate={handleNavChange}
                  initialTarget={navigation.target}
                />
              )}
              {activeNav === "timeline" && (
                <TimelinePage
                  onBack={backToMap}
                  onNavigate={handleNavChange}
                  initialTarget={navigation.target}
                  onPointSelect={handlePointJump}
                />
              )}
              {activeNav === "routes" && (
                <RoutesPage
                  onBack={backToMap}
                  onRouteSelect={handleRouteSelect}
                />
              )}
              {activeNav === "solar" && (
                <SolarTermsPage
                  onBack={backToMap}
                  initialTarget={navigation.target}
                />
              )}
            </>
          ),
        }}
      />
    </div>
  );
}
