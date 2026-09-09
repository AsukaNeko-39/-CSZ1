import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from "react";

const MAGNIFICATION = 3;
const LENS_SIZE = 250;
const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export default function ChartMagnifier({
  src,
  onOpen,
}: {
  src: string;
  onOpen: () => void;
}) {
  const picture = useRef<HTMLImageElement>(null);
  const [lens, setLens] = useState<CSSProperties | null>(null);

  useEffect(() => {
    const hide = () => setLens(null);
    // Geometry changes invalidate the last pointer position.
    window.addEventListener("scroll", hide, { capture: true, passive: true });
    window.addEventListener("resize", hide);
    window.addEventListener("blur", hide);
    return () => {
      window.removeEventListener("scroll", hide, true);
      window.removeEventListener("resize", hide);
      window.removeEventListener("blur", hide);
    };
  }, []);

  function followPointer(event: PointerEvent<HTMLButtonElement>) {
    const image = picture.current;
    if (
      event.pointerType !== "mouse" ||
      event.buttons ||
      !image?.naturalWidth
    ) {
      setLens(null);
      return;
    }

    const bounds = image.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    if (
      !bounds.width ||
      !bounds.height ||
      x < 0 ||
      y < 0 ||
      x > bounds.width ||
      y > bounds.height
    ) {
      setLens(null);
      return;
    }

    const size = Math.min(LENS_SIZE, bounds.width, bounds.height);
    const radius = size / 2;
    // Keep both the lens and its magnified image in bounds at every edge.
    setLens({
      width: size,
      height: size,
      left: image.offsetLeft + clamp(x - radius, 0, bounds.width - size),
      top: image.offsetTop + clamp(y - radius, 0, bounds.height - size),
      backgroundImage: 'url("' + src + '")',
      backgroundSize:
        bounds.width * MAGNIFICATION +
        "px " +
        bounds.height * MAGNIFICATION +
        "px",
      backgroundPosition:
        clamp(
          radius - x * MAGNIFICATION,
          size - bounds.width * MAGNIFICATION,
          0
        ) +
        "px " +
        clamp(
          radius - y * MAGNIFICATION,
          size - bounds.height * MAGNIFICATION,
          0
        ) +
        "px",
    });
  }

  return (
    <button
      type="button"
      className="culture-chart-preview"
      aria-label="放大发展脉络图"
      aria-describedby="culture-chart-hint"
      onPointerEnter={followPointer}
      onPointerMove={followPointer}
      onPointerLeave={() => setLens(null)}
      onPointerCancel={() => setLens(null)}
      onPointerDown={() => setLens(null)}
      onBlur={() => setLens(null)}
      onClick={() => {
        setLens(null);
        onOpen();
      }}
    >
      <img
        ref={picture}
        src={src}
        alt="湖湘农耕文化发展脉络图，展示五个阶段的历史演进"
        loading="lazy"
        draggable={false}
      />
      {lens && (
        <span className="culture-chart-lens" style={lens} aria-hidden="true">
          <span className="culture-chart-lens-label">
            {MAGNIFICATION} 倍细览
          </span>
        </span>
      )}
    </button>
  );
}
