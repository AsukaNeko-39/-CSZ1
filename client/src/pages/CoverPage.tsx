import { useEffect, useState } from "react";
import { ArrowRight, Pause, Play } from "lucide-react";
import RiceField from "@/components/RiceField";
import { culturePoints } from "@/data/points";
import { introCopy } from "@/data/catalog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import "./cover.css";

const categories = [
  { key: "ancient", label: "重要遗址", color: "#a18333" },
  { key: "modern", label: "重大工程", color: "#638c73" },
  { key: "red", label: "重要场馆", color: "#a95647" },
] as const;

export default function CoverPage({ onEnter }: { onEnter: () => void }) {
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);
  const [paused, setPaused] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const still = !!reducedMotion || paused || aboutOpen;

  return (
    <main className="rice-cover" aria-labelledby="rice-cover-title">
      <RiceField paused={still} />
      <div className="rice-cover-mist" aria-hidden="true" />

      <section className="rice-cover-content">
        <p className="rice-cover-english" lang="en">
          HUNAN AGRICULTURAL HERITAGE DIGITAL MAP
        </p>
        <h1 id="rice-cover-title" className="rice-cover-title">
          农耕文化
          <span>数字地图</span>
        </h1>
        <div className="rice-cover-invitation">
          <p className="rice-cover-tagline">
            万年稻作<span>·</span>耕读传家<span>·</span>三湘四水
          </p>
          <p className="rice-cover-caption">循着稻香，探寻湖湘大地的农耕记忆</p>
        </div>
        <button className="rice-cover-enter" onClick={onEnter}>
          <span>探索地图</span>
          <ArrowRight size={17} strokeWidth={1.5} aria-hidden="true" />
        </button>
        <ul className="rice-cover-legend" aria-label="地图收录的文化点位">
          {categories.map(category => (
            <li key={category.key}>
              <i
                style={{ backgroundColor: category.color }}
                aria-hidden="true"
              />
              <span>{category.label}</span>
              <span className="rice-cover-count">
                {
                  culturePoints.filter(point => point.category === category.key)
                    .length
                }
              </span>
            </li>
          ))}
        </ul>
      </section>

      <footer className="rice-cover-footer">
        <button
          className="rice-cover-about"
          onClick={() => setAboutOpen(true)}
          aria-haspopup="dialog"
        >
          关于地图 <span aria-hidden="true">↗</span>
        </button>
        <p className="rice-cover-credits">
          <span>主办单位：湖南省自然资源厅</span>
          <span>承办单位：湖南省第三测绘院</span>
        </p>
        <button
          className="rice-cover-motion"
          onClick={() => setPaused(value => !value)}
          aria-label={
            reducedMotion
              ? "已遵循系统设置，关闭稻田动画"
              : paused
                ? "播放稻田动画"
                : "暂停稻田动画"
          }
          aria-pressed={still}
          disabled={!!reducedMotion}
        >
          <span>{still ? "静听稻香" : "风起稻浪"}</span>
          {still ? (
            <Play size={12} aria-hidden="true" />
          ) : (
            <Pause size={12} aria-hidden="true" />
          )}
        </button>
      </footer>

      <Dialog open={aboutOpen} onOpenChange={setAboutOpen}>
        <DialogContent className="rice-cover-dialog">
          <DialogHeader>
            <p className="rice-cover-dialog-kicker">三湘四水 · 万年稻作</p>
            <DialogTitle>湖湘农耕文化</DialogTitle>
            <DialogDescription>
              一幅地图，展开湖湘万年农耕文明。
            </DialogDescription>
          </DialogHeader>
          <div className="rice-cover-story">
            {introCopy.cover.map(text => (
              <p key={text}>{text}</p>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
