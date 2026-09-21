import { useState } from "react";
import { ArrowRight, BookOpen } from "lucide-react";
import { assetUrl } from "@/lib/assets";
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
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <main className="landscape-cover" aria-labelledby="landscape-cover-title">
      <img
        className="landscape-cover-background"
        src={assetUrl("/materials/welcome/huxiang-landscape-20260922.webp")}
        width={1736}
        height={906}
        alt=""
        aria-hidden="true"
        fetchPriority="high"
        decoding="async"
      />
      <div className="landscape-cover-shade" aria-hidden="true" />

      <section className="landscape-cover-content">
        <p className="landscape-cover-english" lang="en">
          HUNAN AGRICULTURAL HERITAGE DIGITAL MAP
        </p>
        <h1 id="landscape-cover-title" className="landscape-cover-title">
          农耕文化
          <span>数字地图</span>
        </h1>
        <div className="landscape-cover-invitation">
          <p className="landscape-cover-tagline">
            万年稻作<span>·</span>耕读传家<span>·</span>三湘四水
          </p>
          <p className="landscape-cover-caption">循着稻香，探寻湖湘大地的农耕记忆</p>
        </div>
        <button className="landscape-cover-enter" onClick={onEnter}>
          <span>探索地图</span>
          <ArrowRight size={17} strokeWidth={1.5} aria-hidden="true" />
        </button>
        <ul className="landscape-cover-legend" aria-label="地图收录的文化点位">
          {categories.map(category => (
            <li key={category.key}>
              <i
                style={{ backgroundColor: category.color }}
                aria-hidden="true"
              />
              <span>{category.label}</span>
              <span className="landscape-cover-count">
                {
                  culturePoints.filter(point => point.category === category.key)
                    .length
                }
              </span>
            </li>
          ))}
        </ul>
      </section>

      <footer className="landscape-cover-footer">
        <button
          className="landscape-cover-about"
          onClick={() => setAboutOpen(true)}
          aria-haspopup="dialog"
        >
          <BookOpen size={18} strokeWidth={1.5} aria-hidden="true" />
          <span className="sr-only">关于地图</span>
        </button>
        <p className="landscape-cover-credits">
          <span>主办单位：湖南省自然资源厅</span>
          <span>承办单位：湖南省第三测绘院</span>
        </p>
      </footer>

      <Dialog open={aboutOpen} onOpenChange={setAboutOpen}>
        <DialogContent className="landscape-cover-dialog">
          <DialogHeader>
            <p className="landscape-cover-dialog-kicker">三湘四水 · 万年稻作</p>
            <DialogTitle>湖湘农耕文化</DialogTitle>
            <DialogDescription>
              一幅地图，展开湖湘万年农耕文明。
            </DialogDescription>
          </DialogHeader>
          <div className="landscape-cover-story">
            {introCopy.cover.map(text => (
              <p key={text}>{text}</p>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
