import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useReducedMotion } from "framer-motion";
import { sceneryStyle } from "./CultureScenery";

type Scene = {
  id: string;
  section: string;
  label: string;
  direction: number;
  children: ReactNode;
};

export default function CulturePageTransition({
  scene,
  onCurrentRef,
}: {
  scene: Scene;
  onCurrentRef: (node: HTMLDivElement | null) => void;
}) {
  const reducedMotion = useReducedMotion();
  const [activeId, setActiveId] = useState(scene.id);
  const [outgoing, setOutgoing] = useState<Scene | null>(null);
  const lastScene = useRef(scene);

  // Retain only the last committed screen, even when navigation is interrupted.
  if (activeId !== scene.id) {
    setActiveId(scene.id);
    setOutgoing(reducedMotion ? null : lastScene.current);
  }
  useLayoutEffect(() => {
    lastScene.current = scene;
  });
  useEffect(() => {
    const timer = window.setTimeout(
      () => setOutgoing(null),
      reducedMotion ? 0 : 210
    );
    return () => window.clearTimeout(timer);
  }, [scene.id, reducedMotion]);

  function frame(item: Scene, leaving: boolean) {
    return (
      <div
        key={item.id}
        ref={leaving ? undefined : onCurrentRef}
        data-section={item.section}
        data-page-state={leaving ? "leaving" : "current"}
        aria-label={`${item.label}页面`}
        aria-hidden={leaving || undefined}
        inert={leaving || undefined}
        className={`culture-page-transition ${leaving ? "culture-page-leave" : "culture-page-enter"} ${item.section === "map" ? "flex flex-col overflow-hidden" : "overflow-y-auto"}`}
        style={{ "--page-direction": scene.direction } as CSSProperties}
      >
        {item.children}
      </div>
    );
  }

  return (
    <div className="culture-stage" style={sceneryStyle("routes-hero-bg.webp")}>
      {outgoing && frame(outgoing, true)}
      {frame(scene, false)}
    </div>
  );
}
