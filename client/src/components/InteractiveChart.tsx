import { useEffect, useRef, type PointerEvent } from "react";
import { ArrowUpRight, BookOpen } from "lucide-react";

const HOVER_ZOOM = 2.8;

export default function InteractiveChart({
  src,
  onOpen,
}: {
  src: string;
  onOpen: () => void;
}) {
  const surface = useRef<HTMLElement>(null);
  const viewport = useRef<HTMLButtonElement>(null);
  const picture = useRef<HTMLImageElement>(null);
  const bounds = useRef<DOMRect | null>(null);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const frame = useRef<number | null>(null);
  const reducedMotion = useRef(false);

  function leave() {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    pointer.current = null;
    bounds.current = null;
    if (surface.current?.dataset.hovered === "true") {
      surface.current.dataset.hovered = "false";
      picture.current?.style.removeProperty("transform");
    }
  }

  function paint() {
    frame.current = null;
    const image = picture.current;
    const button = viewport.current;
    const figure = surface.current;
    const point = pointer.current;
    if (!image?.naturalWidth || !button || !figure || !point) return;
    // Measure the stationary frame once; the image itself changes size as it zooms.
    bounds.current ??= button.getBoundingClientRect();
    const area = bounds.current;
    const x = point.x - area.left;
    const y = point.y - area.top;
    if (x < 0 || y < 0 || x > area.width || y > area.height) {
      leave();
      return;
    }
    // This translation keeps the point under the cursor in place at every edge.
    image.style.transform = `translate3d(${x * (1 - HOVER_ZOOM)}px, ${y * (1 - HOVER_ZOOM)}px, 0) scale(${HOVER_ZOOM})`;
    figure.dataset.hovered = "true";
  }

  function followPointer(event: PointerEvent<HTMLButtonElement>) {
    if (
      event.pointerType !== "mouse" ||
      event.buttons ||
      reducedMotion.current
    ) {
      leave();
      return;
    }
    pointer.current = { x: event.clientX, y: event.clientY };
    if (frame.current === null) frame.current = requestAnimationFrame(paint);
  }

  function open() {
    leave();
    onOpen();
  }

  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => {
      reducedMotion.current = preference.matches;
      leave();
    };
    updatePreference();
    const observer = new ResizeObserver(leave);
    if (viewport.current) observer.observe(viewport.current);
    preference.addEventListener("change", updatePreference);
    window.addEventListener("scroll", leave, { capture: true, passive: true });
    window.addEventListener("resize", leave);
    window.addEventListener("blur", leave);
    return () => {
      leave();
      observer.disconnect();
      preference.removeEventListener("change", updatePreference);
      window.removeEventListener("scroll", leave, true);
      window.removeEventListener("resize", leave);
      window.removeEventListener("blur", leave);
    };
  }, [src]);

  return (
    <figure ref={surface} className="culture-chart-interactive">
      <button
        ref={viewport}
        type="button"
        className="culture-chart-preview"
        aria-label="放大发展脉络图"
        aria-describedby="culture-chart-hint"
        onPointerEnter={followPointer}
        onPointerMove={followPointer}
        onPointerLeave={leave}
        onPointerCancel={leave}
        onPointerDown={leave}
        onBlur={leave}
        onClick={open}
      >
        <img
          ref={picture}
          src={src}
          alt="湖湘农耕文化发展脉络图，展示五个阶段的历史演进"
          loading="lazy"
          draggable={false}
        />
      </button>
      <figcaption className="culture-chart-reading">
        <span className="culture-chart-reading-icon" aria-hidden="true">
          <BookOpen size={20} />
        </span>
        <span className="culture-chart-reading-copy">
          <strong>一卷长图，读懂湖湘农耕</strong>
          <span id="culture-chart-hint">
            <span className="culture-chart-hover-hint">
              悬停渐进放大，移动查看细节 ·{" "}
            </span>
            点击展开长图
          </span>
        </span>
        <button type="button" className="culture-chart-open" onClick={open}>
          展开长图 <ArrowUpRight size={17} aria-hidden="true" />
        </button>
      </figcaption>
    </figure>
  );
}
