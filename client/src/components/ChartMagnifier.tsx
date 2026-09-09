import { useEffect, useRef, type PointerEvent } from "react";
import { createPortal } from "react-dom";

const MAGNIFICATION = 3;
const PANEL_WIDTH = 380;
const DETAIL_HEIGHT = 210;
const HEADER_HEIGHT = 28;
const GAP = 14;
const MARGIN = 12;
const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

type Geometry = {
  bounds: DOMRect;
  left: number;
  top: number;
  width: number;
  height: number;
  panelY: number;
  viewportWidth: number;
};

export default function ChartMagnifier({
  src,
  onOpen,
}: {
  src: string;
  onOpen: () => void;
}) {
  const picture = useRef<HTMLImageElement>(null);
  const lens = useRef<HTMLDivElement>(null);
  const selection = useRef<HTMLSpanElement>(null);
  const magnified = useRef<HTMLImageElement>(null);
  const geometry = useRef<Geometry | null>(null);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const frame = useRef<number | null>(null);

  function hide() {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    pointer.current = null;
    geometry.current = null;
    for (const element of [lens.current, selection.current]) {
      if (element?.dataset.active === "true") element.dataset.active = "false";
    }
  }

  function paint() {
    frame.current = null;
    const image = picture.current;
    const panel = lens.current;
    const marker = selection.current;
    const detail = magnified.current;
    const position = pointer.current;
    if (
      !image ||
      !panel ||
      !marker ||
      !detail?.complete ||
      !detail.naturalWidth ||
      !position
    )
      return;

    if (!geometry.current) {
      // Cache layout for this hover; scrolling and resizing invalidate it.
      const bounds = image.getBoundingClientRect();
      const viewportWidth = document.documentElement.clientWidth;
      const viewportHeight = window.innerHeight;
      if (!bounds.width || !bounds.height) return;
      const above = bounds.top - GAP - MARGIN;
      const below = viewportHeight - MARGIN - bounds.bottom - GAP;
      const placement = above >= below ? "above" : "below";
      const room = Math.max(above, below);
      const width = Math.min(
        PANEL_WIDTH,
        viewportWidth - MARGIN * 2,
        bounds.width * MAGNIFICATION
      );
      const height = Math.min(
        DETAIL_HEIGHT,
        room - HEADER_HEIGHT,
        bounds.height * MAGNIFICATION
      );
      // A tiny viewport can still use the existing click-to-open full image.
      if (width <= 0 || height < 24) {
        hide();
        return;
      }
      geometry.current = {
        bounds,
        width,
        height,
        left: image.offsetLeft,
        top: image.offsetTop,
        viewportWidth,
        panelY:
          placement === "above"
            ? bounds.top - GAP - height - HEADER_HEIGHT
            : bounds.bottom + GAP,
      };
      panel.dataset.placement = placement;
      panel.style.width = width + "px";
      panel.style.height = height + HEADER_HEIGHT + "px";
      marker.style.width = width / MAGNIFICATION + "px";
      marker.style.height = height / MAGNIFICATION + "px";
      detail.style.width = bounds.width * MAGNIFICATION + "px";
      detail.style.height = bounds.height * MAGNIFICATION + "px";
    }

    const { bounds, width, height, left, top, panelY, viewportWidth } =
      geometry.current;
    const x = position.x - bounds.left;
    const y = position.y - bounds.top;
    if (x < 0 || y < 0 || x > bounds.width || y > bounds.height) {
      hide();
      return;
    }

    const sourceX = clamp(
      x - width / MAGNIFICATION / 2,
      0,
      bounds.width - width / MAGNIFICATION
    );
    const sourceY = clamp(
      y - height / MAGNIFICATION / 2,
      0,
      bounds.height - height / MAGNIFICATION
    );
    const panelX = clamp(
      position.x - width / 2,
      MARGIN,
      viewportWidth - width - MARGIN
    );
    // Only move compositor layers; the high-resolution image is not repainted.
    panel.style.transform = "translate3d(" + panelX + "px," + panelY + "px,0)";
    detail.style.transform =
      "translate3d(" +
      -sourceX * MAGNIFICATION +
      "px," +
      -sourceY * MAGNIFICATION +
      "px,0)";
    marker.style.transform =
      "translate3d(" + (left + sourceX) + "px," + (top + sourceY) + "px,0)";
    for (const element of [panel, marker]) {
      if (element.dataset.active !== "true") element.dataset.active = "true";
    }
  }

  function queueFrame() {
    if (pointer.current && frame.current === null)
      frame.current = requestAnimationFrame(paint);
  }

  function prepareImage() {
    const image = picture.current;
    const detail = magnified.current;
    if (
      image?.naturalWidth &&
      detail &&
      detail.getAttribute("src") !== image.currentSrc
    ) {
      // Preserve lazy loading and reuse the already decoded preview.
      detail.src = image.currentSrc;
    }
  }

  function followPointer(event: PointerEvent<HTMLButtonElement>) {
    if (
      event.pointerType !== "mouse" ||
      event.buttons ||
      !picture.current?.naturalWidth
    ) {
      hide();
      return;
    }
    pointer.current = { x: event.clientX, y: event.clientY };
    queueFrame();
  }

  useEffect(() => {
    hide();
    prepareImage();
    const observer = new ResizeObserver(hide);
    if (picture.current) observer.observe(picture.current);
    window.addEventListener("scroll", hide, { capture: true, passive: true });
    window.addEventListener("resize", hide);
    window.addEventListener("blur", hide);
    return () => {
      hide();
      observer.disconnect();
      window.removeEventListener("scroll", hide, true);
      window.removeEventListener("resize", hide);
      window.removeEventListener("blur", hide);
    };
  }, [src]);

  return (
    <>
      <button
        type="button"
        className="culture-chart-preview"
        aria-label="放大发展脉络图"
        aria-describedby="culture-chart-hint"
        onPointerEnter={followPointer}
        onPointerMove={followPointer}
        onPointerLeave={hide}
        onPointerCancel={hide}
        onPointerDown={hide}
        onBlur={hide}
        onClick={() => {
          hide();
          onOpen();
        }}
      >
        <img
          ref={picture}
          src={src}
          alt="湖湘农耕文化发展脉络图，展示五个阶段的历史演进"
          loading="lazy"
          draggable={false}
          onLoad={prepareImage}
        />
        <span
          ref={selection}
          className="culture-chart-selection"
          aria-hidden="true"
        />
      </button>
      {createPortal(
        <div ref={lens} className="culture-chart-lens" aria-hidden="true">
          <div className="culture-chart-lens-heading">
            <span>局部细览</span>
            <b>{MAGNIFICATION} 倍</b>
          </div>
          <div className="culture-chart-lens-viewport">
            <img
              ref={magnified}
              className="culture-chart-lens-image"
              alt=""
              decoding="async"
              draggable={false}
              onLoad={queueFrame}
              onError={hide}
            />
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
