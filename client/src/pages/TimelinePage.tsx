import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { timeline } from "@/data/catalog";
import { assetUrl } from "@/lib/assets";
import { SectionHeading } from "./CatalogPage";

export default function TimelinePage({ onBack }: { onBack: () => void }) {
  const [active, setActive] = useState(0);
  const [chartOpen, setChartOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const cards = useRef<HTMLDivElement>(null);
  const chart = assetUrl("/materials/01发展脉络图.jpg");
  function move(index: number) {
    setActive(index);
    const container = cards.current;
    const card = container?.children[index] as HTMLElement | undefined;
    if (container && card)
      container.scrollTo({
        left:
          card.offsetLeft -
          container.offsetLeft -
          (container.clientWidth - card.clientWidth) / 2,
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
  }
  return (
    <main className="culture-timeline">
      <SectionHeading
        title="发展脉络"
        introduction="从稻作起源到现代农业，循着五个历史阶段，读懂湖湘农耕文化的传承与发展。"
        onBack={onBack}
      />
      <nav className="culture-timeline-nav" aria-label="发展阶段">
        {timeline.map((item, index) => (
          <button
            key={item.id}
            aria-current={index === active ? "step" : undefined}
            onClick={() => move(index)}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{item.era}</strong>
            <small>{item.period}</small>
          </button>
        ))}
      </nav>
      <div className="culture-timeline-toolbar">
        <span>五个发展阶段</span>
        <div>
          <button
            onClick={() => move(Math.max(0, active - 1))}
            disabled={active === 0}
            aria-label="上一个阶段"
          >
            <ChevronLeft size={19} />
          </button>
          <button
            onClick={() => move(Math.min(timeline.length - 1, active + 1))}
            disabled={active === timeline.length - 1}
            aria-label="下一个阶段"
          >
            <ChevronRight size={19} />
          </button>
        </div>
      </div>
      <div
        ref={cards}
        className="culture-timeline-cards"
        onScroll={() => {
          const container = cards.current;
          if (!container) return;
          const center = container.scrollLeft + container.clientWidth / 2;
          let nearest = 0,
            distance = Infinity;
          Array.from(container.children).forEach((node, index) => {
            const el = node as HTMLElement;
            const d = Math.abs(
              el.offsetLeft - container.offsetLeft + el.clientWidth / 2 - center
            );
            if (d < distance) {
              distance = d;
              nearest = index;
            }
          });
          setActive(nearest);
        }}
      >
        {timeline.map((item, index) => (
          <article className="culture-era" key={item.id} aria-label={item.era}>
            <div className="culture-era-visual">
              <img src={assetUrl(item.image)} alt={item.era} loading="lazy" />
              <span>{item.era}</span>
              <strong>{String(index + 1).padStart(2, "0")}</strong>
            </div>
            <div className="culture-era-body">
              <p className="culture-overline">{item.period}</p>
              <h2>{item.title}</h2>
              <div className="culture-prose">
                {item.description.split("\n").map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
              <h3>关键事件</h3>
              <ul>
                {item.events.map(event => (
                  <li key={event}>{event}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
      <section className="culture-chart">
        <div>
          <h2>湖湘农耕文化发展脉络图</h2>
          <button
            onClick={() => {
              setZoom(1);
              setChartOpen(true);
            }}
          >
            <Expand size={16} />
            放大查看
          </button>
        </div>
        <button
          className="culture-chart-preview"
          onClick={() => {
            setZoom(1);
            setChartOpen(true);
          }}
          aria-label="放大发展脉络图"
        >
          <img
            src={chart}
            alt="湖湘农耕文化发展脉络图，展示五个阶段的历史演进"
            loading="lazy"
          />
        </button>
      </section>
      <Dialog open={chartOpen} onOpenChange={setChartOpen}>
        <DialogContent
          className="culture-chart-dialog sm:max-w-[95vw]"
          showCloseButton={false}
        >
          <DialogClose className="culture-dialog-close" aria-label="关闭脉络图">
            <X size={20} />
          </DialogClose>
          <DialogTitle>湖湘农耕文化发展脉络图</DialogTitle>
          <DialogDescription>
            放大后可横向和纵向滚动查看细节。
          </DialogDescription>
          <label className="culture-zoom">
            缩放{" "}
            <input
              type="range"
              min="1"
              max="6"
              step="0.5"
              value={zoom}
              onChange={e => setZoom(Number(e.target.value))}
              aria-label="脉络图缩放"
            />
            <span>{zoom * 100}%</span>
            <a href={chart} target="_blank" rel="noreferrer">
              查看原图
            </a>
          </label>
          <div className="culture-chart-scroll">
            <img
              src={chart}
              alt="湖湘农耕文化完整发展脉络图"
              style={{ width: `${zoom * 100}%`, maxWidth: "none" }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
