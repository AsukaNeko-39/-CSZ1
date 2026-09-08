import { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Expand,
  X,
  ArrowUpRight,
  MapPin,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { timeline } from "@/data/catalog";
import { culturePoints } from "@/data/points";
import { assetUrl } from "@/lib/assets";
import { SectionHeading } from "./CatalogPage";
import BookReader from "@/components/BookReader";
import {
  SectionJourney,
  sceneryStyle,
  type NavigateCulture,
} from "@/components/CultureScenery";

export default function TimelinePage({
  onBack,
  onNavigate,
  initialTarget,
  onPointSelect,
}: {
  onBack: () => void;
  onNavigate: NavigateCulture;
  initialTarget?: string;
  onPointSelect: (id: string) => void;
}) {
  const initialIndex = Math.max(
    0,
    timeline.findIndex(item => item.id === initialTarget)
  );
  const [active, setActive] = useState(initialIndex);
  const [chartOpen, setChartOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const cards = useRef<HTMLDivElement>(null);
  const navigation = useRef<HTMLElement>(null);
  const chart = assetUrl("/materials/01发展脉络图.jpg");
  function move(index: number, smooth = true) {
    setActive(index);
    const container = cards.current;
    const card = container?.children[index] as HTMLElement | undefined;
    const behavior =
      smooth && !matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "smooth"
        : "instant";
    if (container && card)
      container.scrollTo({
        left:
          card.offsetLeft -
          container.offsetLeft -
          (container.clientWidth - card.clientWidth) / 2,
        behavior,
      });
    const nav = navigation.current,
      button = nav?.children[index] as HTMLElement | undefined;
    if (nav && button)
      nav.scrollTo({
        left:
          button.offsetLeft -
          nav.offsetLeft -
          (nav.clientWidth - button.clientWidth) / 2,
        behavior,
      });
  }
  useEffect(() => {
    if (!initialTarget) return;
    const frame = requestAnimationFrame(() =>
      move(
        Math.max(
          0,
          timeline.findIndex(item => item.id === initialTarget)
        ),
        false
      )
    );
    return () => cancelAnimationFrame(frame);
  }, [initialTarget]);

  return (
    <main
      className="culture-timeline"
      style={sceneryStyle("timeline-hero-bg.webp")}
    >
      <SectionHeading
        title="发展脉络"
        introduction="从稻作起源到现代农业，循着五个历史阶段，读懂湖湘农耕文化的传承与发展。"
        onBack={onBack}
        kind="timeline"
        onNavigate={onNavigate}
      />
      <nav
        ref={navigation}
        className="culture-timeline-nav"
        aria-label="发展阶段"
      >
        {timeline.map((item, index) => (
          <button
            key={item.id}
            aria-current={active === index ? "step" : undefined}
            onClick={() => move(index)}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{item.era}</strong>
            <small>{item.period}</small>
          </button>
        ))}
      </nav>
      <div className="culture-timeline-toolbar">
        <span>
          第 {String(active + 1).padStart(2, "0")} 章 · {timeline[active].era}
          <small>滑动切换时代 · 翻页细读历史</small>
        </span>
        <div>
          <button
            onClick={() => move(active - 1)}
            disabled={active === 0}
            aria-label="上一个阶段"
          >
            <ChevronLeft size={19} />
          </button>
          <button
            onClick={() => move(active + 1)}
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
          const box = cards.current;
          if (!box) return;
          const center = box.scrollLeft + box.clientWidth / 2;
          let closest = 0,
            distance = Infinity;
          Array.from(box.children).forEach((node, index) => {
            const element = node as HTMLElement;
            const d = Math.abs(
              element.offsetLeft -
                box.offsetLeft +
                element.clientWidth / 2 -
                center
            );
            if (d < distance) {
              closest = index;
              distance = d;
            }
          });
          setActive(closest);
        }}
      >
        {timeline.map((item, index) => {
          const keyword = ["玉蟾岩", "紫鹊界", "", "", "杂交水稻"][index];
          const point = keyword
            ? culturePoints.find(p => p.name.includes(keyword))
            : undefined;
          return (
            <article
              className="culture-era"
              key={item.id}
              aria-label={item.era}
              data-active={active === index}
            >
              <div className="culture-era-visual">
                <img src={assetUrl(item.image)} alt={item.era} loading="lazy" />
                <div className="culture-era-art-wash" />
                <span className="era-stamp">
                  湖湘纪事 · {String(index + 1).padStart(2, "0")}
                </span>
                <div className="era-visual-caption">
                  <small>{item.period}</small>
                  <h2>{item.era}</h2>
                  <p>以时代为经，以农耕为纬</p>
                </div>
                <div className="era-related">
                  {point && (
                    <button onClick={() => onPointSelect(point.id)}>
                      <MapPin size={14} />
                      在地图中查看
                      <ArrowUpRight size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => onNavigate("land", "category:" + item.era)}
                  >
                    同期土地制度
                    <ArrowUpRight size={14} />
                  </button>
                </div>
              </div>
              <div className="culture-era-body">
                <div className="era-page-heading">
                  <p className="culture-overline">
                    CHAPTER {String(index + 1).padStart(2, "0")} / 湖湘农耕文化
                  </p>
                  <h2>{item.title}</h2>
                </div>
                <BookReader
                  text={
                    item.description +
                    "\n\n关键事件\n" +
                    item.events.map(event => "· " + event).join("\n")
                  }
                  title={item.era}
                />
              </div>
            </article>
          );
        })}
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
      <SectionJourney current="timeline" onNavigate={onNavigate} />
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
