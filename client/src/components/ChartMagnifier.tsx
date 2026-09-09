import { useEffect, useRef, type PointerEvent } from "react";

const MAGNIFICATION = 3;
const LENS_SIZE = 250;
const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

type Geometry = {
  bounds: DOMRect;
  left: number;
  top: number;
  size: number;
};

export default function ChartMagnifier({
  src,
  onOpen,
}: {
  src: string;
  onOpen: () => void;
}) {
  const picture = useRef<HTMLImageElement>(null);
  const lens = useRef<HTMLSpanElement>(null);
  const magnified = useRef<HTMLImageElement>(null);
  const geometry = useRef<Geometry | null>(null);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const frame = useRef<number | null>(null);

  function hide() {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    pointer.current = null;
    geometry.current = null;
    if (lens.current?.dataset.active === "true") {
      lens.current.dataset.active = "false";
    }
  }

  function paint() {
    frame.current = null;
    const image = picture.current;
    const glass = lens.current;
    const detail = magnified.current;
    const position = pointer.current;
    if (
      !image ||
      !glass ||
      !detail?.complete ||
      !detail.naturalWidth ||
      !position
    )
      return;

    // Read geometry once per hover, before writing any styles.
    if (!geometry.current) {
      const bounds = image.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      const size = Math.min(LENS_SIZE, bounds.width, bounds.height);
      geometry.current = {
        bounds,
        size,
        left: image.offsetLeft,
        top: image.offsetTop,
      };
      glass.style.width = size + "px";
      glass.style.height = size + "px";
      detail.style.width = bounds.width * MAGNIFICATION + "px";
      detail.style.height = bounds.height * MAGNIFICATION + "px";
    }

    const { bounds, size, left, top } = geometry.current;
    const x = position.x - bounds.left;
    const y = position.y - bounds.top;
    if (x < 0 || y < 0 || x > bounds.width || y > bounds.height) {
      hide();
      return;
    }

    const radius = size / 2;
    const lensX = left + clamp(x - radius, 0, bounds.width - size);
    const lensY = top + clamp(y - radius, 0, bounds.height - size);
    const imageX = clamp(
      radius - x * MAGNIFICATION,
      size - bounds.width * MAGNIFICATION,
      0
    );
    const imageY = clamp(
      radius - y * MAGNIFICATION,
      size - bounds.height * MAGNIFICATION,
      0
    );
    // Move compositor layers instead of repainting a huge CSS background.
    glass.style.transform = "translate3d(" + lensX + "px," + lensY + "px,0)";
    detail.style.transform = "translate3d(" + imageX + "px," + imageY + "px,0)";
    if (glass.dataset.active !== "true") glass.dataset.active = "true";
  }

  function queueFrame() {
    if (pointer.current && frame.current === null) {
      frame.current = requestAnimationFrame(paint);
    }
  }

  function prepareImage() {
    const image = picture.current;
    const detail = magnified.current;
    if (
      image?.naturalWidth &&
      detail &&
      detail.getAttribute("src") !== image.currentSrc
    ) {
      // Reuse the decoded preview only after it loads, preserving lazy loading.
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
      <span ref={lens} className="culture-chart-lens" aria-hidden="true">
        <span className="culture-chart-lens-viewport">
          <img
            ref={magnified}
            className="culture-chart-lens-image"
            alt=""
            decoding="async"
            draggable={false}
            onLoad={queueFrame}
            onError={hide}
          />
        </span>
        <span className="culture-chart-lens-label">{MAGNIFICATION} 倍细览</span>
      </span>
    </button>
  );
}
