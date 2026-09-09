import { useEffect, useRef, type PointerEvent } from "react";
import { ArrowUpRight, BookOpen } from "lucide-react";

export default function InteractiveChart({
  src,
  onOpen,
}: {
  src: string;
  onOpen: () => void;
}) {
  const surface = useRef<HTMLElement>(null);
  const picture = useRef<HTMLImageElement>(null);
  const glow = useRef<HTMLSpanElement>(null);
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
    }
  }

  function paint() {
    frame.current = null;
    const image = picture.current;
    const light = glow.current;
    const point = pointer.current;
    if (!image?.naturalWidth || !light || !point) return;
    // Cache geometry and move a small gradient layer, keeping the chart static.
    bounds.current ??= image.getBoundingClientRect();
    const area = bounds.current;
    const x = point.x - area.left;
    const y = point.y - area.top;
    if (x < 0 || y < 0 || x > area.width || y > area.height) {
      leave();
      return;
    }
    light.style.transform =
      "translate3d(" + (x - 280) + "px," + (y - 180) + "px,0)";
    if (surface.current?.dataset.hovered !== "true") {
      surface.current!.dataset.hovered = "true";
    }
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
    if (picture.current) observer.observe(picture.current);
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
        <span className="culture-chart-light" aria-hidden="true">
          <span ref={glow} className="culture-chart-glow" />
          <span className="culture-chart-edge-wash" />
        </span>
      </button>
      <figcaption className="culture-chart-reading">
        <span className="culture-chart-reading-icon" aria-hidden="true">
          <BookOpen size={20} />
        </span>
        <span className="culture-chart-reading-copy">
          <strong>一卷长图，读懂湖湘农耕</strong>
          <span id="culture-chart-hint">点击展开，细读图中的历史与故事</span>
        </span>
        <button type="button" className="culture-chart-open" onClick={open}>
          展开长图 <ArrowUpRight size={17} aria-hidden="true" />
        </button>
      </figcaption>
    </figure>
  );
}
