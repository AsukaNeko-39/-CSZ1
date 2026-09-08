import type { CSSProperties } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight, Sprout } from "lucide-react";
import { assetUrl } from "@/lib/assets";

export type NavigateCulture = (section: string, target?: string) => void;
export const chapters = [
  {
    id: "map",
    name: "地图浏览",
    note: "循三湘四水，访农耕遗迹",
    image: "point-ziquejie.jpg",
  },
  {
    id: "timeline",
    name: "发展脉络",
    note: "从一粒稻谷，读万年文明",
    image: "timeline-hero-bg.webp",
  },
  {
    id: "land",
    name: "土地制度",
    note: "阅历代田制，见土地变迁",
    image: "artifacts-hero-bg.webp",
  },
  {
    id: "folk",
    name: "民俗文化",
    note: "循四时农事，寻耕读乡情",
    image: "routes-hero-bg.webp",
  },
  {
    id: "artifacts",
    name: "重要文物",
    note: "以器物为证，读农耕记忆",
    image: "grain-processing_c71ef1ab.jpg",
  },
];

export function sceneryStyle(scene = "artifacts-hero-bg.webp"): CSSProperties {
  return {
    "--culture-scene": `url("${assetUrl("/manus-storage/" + scene)}")`,
    "--culture-field": `url("${assetUrl("/manus-storage/bottom-field-decor.webp")}")`,
  } as CSSProperties;
}

export function ChapterSwitch({
  current,
  onNavigate,
}: {
  current: string;
  onNavigate?: NavigateCulture;
}) {
  if (!onNavigate) return null;
  const index = chapters.findIndex(chapter => chapter.id === current);
  const previous = chapters[(index + chapters.length - 1) % chapters.length];
  const next = chapters[(index + 1) % chapters.length];
  return (
    <div className="chapter-switch" aria-label="切换专题">
      <button
        onClick={() => onNavigate(previous.id)}
        aria-label={`上一专题：${previous.name}`}
      >
        <ChevronLeft size={14} />
        <span>{previous.name}</span>
      </button>
      <span className="chapter-switch-count">
        {String(index + 1).padStart(2, "0")} / 05
      </span>
      <button
        onClick={() => onNavigate(next.id)}
        aria-label={`下一专题：${next.name}`}
      >
        <span>{next.name}</span>
        <ChevronRight size={14} />
      </button>
    </div>
  );
}

export function SectionJourney({
  current,
  onNavigate,
}: {
  current: string;
  onNavigate?: NavigateCulture;
}) {
  if (!onNavigate) return null;
  return (
    <section className="culture-journey" aria-label="继续探索其他专题">
      <div className="culture-journey-title">
        <Sprout size={18} />
        <span>一脉相承 · 继续探索</span>
      </div>
      <div className="culture-journey-grid">
        {chapters
          .filter(chapter => chapter.id !== current)
          .map(chapter => (
            <button
              key={chapter.id}
              onClick={() => onNavigate(chapter.id)}
              style={{
                backgroundImage: `url("${assetUrl("/manus-storage/" + chapter.image)}")`,
              }}
            >
              <span>
                <strong>{chapter.name}</strong>
                <small>{chapter.note}</small>
              </span>
              <ArrowUpRight size={20} />
            </button>
          ))}
      </div>
    </section>
  );
}
