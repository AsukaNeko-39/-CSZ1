import { useEffect, useRef } from "react";

type Stalk = {
  x: number;
  y: number;
  height: number;
  depth: number;
  lean: number;
  phase: number;
  grain: number;
  grains: number;
  stem: string;
  gold: string;
};

/** A perspective rice field: wind travels across the field instead of moving it as one image. */
export default function RiceField({ paused }: { paused: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !ctx) return;
    let width = 0;
    let height = 0;
    let stalks: Stalk[] = [];
    let frame = 0;
    let previous = 0;
    let inView = true;
    let disposed = false;

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      ctx.lineCap = "round";
      const time = timeRef.current;
      for (const stalk of stalks) {
        const { x, y, depth, grain } = stalk;
        // Nearby stalks share a travelling gust, with a smaller individual flutter.
        const wave = Math.sin(time * 1.12 - (x / width) * 7.2 + depth * 3.8);
        const ripple =
          Math.sin(time * 1.83 - (x / width) * 11 + stalk.phase) * 0.022;
        const bend = stalk.height * (stalk.lean + 0.09 + wave * 0.09 + ripple);
        const tipX = x + bend;
        const tipY = y - stalk.height + Math.abs(bend) * 0.13;
        const bow = grain * (1.1 + depth);
        ctx.strokeStyle = stalk.stem;
        ctx.lineWidth = 0.45 + depth * 0.8;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(
          x + bend * 0.16,
          y - stalk.height * 0.57,
          tipX,
          tipY
        );
        ctx.stroke();

        // A slender, slightly nodding panicle rather than a rigid wheat spike.
        ctx.beginPath();
        ctx.moveTo(tipX, tipY + grain * 2.2);
        ctx.quadraticCurveTo(
          tipX + bow * 0.5,
          tipY - grain * 2.3,
          tipX + bow * 1.6,
          tipY - grain * 0.5
        );
        ctx.stroke();
        ctx.fillStyle = stalk.gold;
        const grains = stalk.grains;
        for (let j = 0; j < grains; j++) {
          const gx = tipX + bow * (0.2 + j * 0.62);
          const gy = tipY - grain * (j === 1 ? 1.05 : 0.3);
          ctx.beginPath();
          ctx.ellipse(
            gx,
            gy,
            grain * 0.58,
            grain * 1.25,
            -0.2 + (bend / stalk.height) * 1.2 + j * 0.3,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
        if (depth > 0.65 && stalk.phase > 4.9) {
          ctx.beginPath();
          ctx.moveTo(x + bend * 0.12, y - stalk.height * 0.24);
          ctx.quadraticCurveTo(
            x - grain * 3,
            y - stalk.height * 0.48,
            x - grain * 3.4 + bend * 0.25,
            y - stalk.height * 0.63
          );
          ctx.stroke();
        }
      }
    }

    function tick(now: number) {
      if (disposed || paused || document.hidden || !inView) return;
      if (!previous) previous = now;
      const delta = now - previous;
      // Cap at 30 fps and avoid animation jumps after a hidden tab resumes.
      if (delta >= 1000 / 30) {
        timeRef.current += Math.min(delta, 60) / 1000;
        previous = now;
        draw();
      }
      frame = requestAnimationFrame(tick);
    }

    function syncAnimation() {
      cancelAnimationFrame(frame);
      previous = 0;
      draw();
      if (!disposed && !paused && !document.hidden && inView)
        frame = requestAnimationFrame(tick);
    }

    function resize() {
      if (!canvas || !ctx) return;
      const bounds = canvas.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      if (!width || !height) return;
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      // Seeded placement stays stable through pause, resize and React updates.
      let seed = 3921;
      const random = () => {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        return seed / 4294967296;
      };
      const count = Math.round(Math.max(280, Math.min(780, width * 0.48)));
      const horizon = height * (width < 600 ? 0.47 : 0.46);
      const scale = Math.min(height / 800, 1.45);
      stalks = Array.from({ length: count }, (_, index) => {
        const depth = (index + random()) / count;
        const perspective = Math.pow(depth, 1.65);
        const x = (random() * 1.16 - 0.08) * width;
        const center = Math.max(0, 1 - Math.abs(x / width - 0.5) * 3.6);
        // Open a soft corridor behind the invitation; retain rice on both sides.
        const quiet = 1 - center * 0.55;
        const opacity = (0.19 + depth * 0.36) * quiet;
        return {
          x,
          y: horizon + perspective * height * 0.81,
          height:
            (14 + Math.pow(depth, 1.15) * 224) *
            (0.67 + random() * 0.62) *
            scale,
          depth,
          lean: (random() - 0.5) * 0.23,
          phase: random() * Math.PI * 2,
          grain:
            (0.65 + Math.pow(depth, 1.25) * 5.4) *
            (0.8 + random() * 0.4) *
            Math.min(scale, 1.2),
          grains: random() < 0.67 ? 1 : 2,
          stem: `rgba(176, 163, 66, ${opacity * 0.76})`,
          gold: `rgba(${202 + Math.round(random() * 20)}, ${177 + Math.round(random() * 24)}, 63, ${opacity + 0.14})`,
        };
      });
      syncAnimation();
    }

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    const intersection = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      syncAnimation();
    });
    intersection.observe(canvas);
    document.addEventListener("visibilitychange", syncAnimation);
    resize();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      intersection.disconnect();
      document.removeEventListener("visibilitychange", syncAnimation);
    };
  }, [paused]);

  return (
    <canvas
      ref={canvasRef}
      className="rice-cover-field"
      aria-hidden="true"
      data-motion={paused ? "still" : "wind"}
    />
  );
}
