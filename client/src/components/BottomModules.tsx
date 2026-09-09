import { ArrowUpRight, ChevronRight } from "lucide-react";
import { timeline, landItems, folkItems, artifactItems } from "@/data/catalog";
import { themeRoutes } from "@/data/points";
import { assetUrl } from "@/lib/assets";
import { sceneryStyle, type NavigateCulture } from "./CultureScenery";

interface Props {
  onNavigate: NavigateCulture;
  onRouteSelect: (id: string) => void;
}
const icons = [
  "timeline-icon-1-prehistoric.webp",
  "timeline-icon-3-bronze-age.webp",
  "timeline-icon-4-imperial.webp",
  "timeline-icon-5-modern.webp",
  "timeline-icon-6-hybrid-rice.webp",
];
const eras = ["稻作起源", "两汉隋唐", "两宋清初", "晚清民国", "新中国至今"];
const terms = [
  ["立春", "lichun", "s1"],
  ["雨水", "yushui", "s2"],
  ["惊蛰", "jingzhe", "s3"],
  ["春分", "chunfen", "s4"],
  ["清明", "qingming", "s5"],
  ["谷雨", "guyu", "s6"],
];

function DockHeading({
  title,
  more,
  onClick,
}: {
  title: string;
  more: string;
  onClick: () => void;
}) {
  return (
    <div className="dock-heading">
      <h2>
        <img src={assetUrl("/manus-storage/rice-icon-headline.webp")} alt="" />
        {title}
      </h2>
      <button onClick={onClick}>
        {more}
        <ChevronRight size={12} />
      </button>
    </div>
  );
}

export default function BottomModules({ onNavigate, onRouteSelect }: Props) {
  return (
    <section
      className="heritage-dock"
      style={sceneryStyle()}
      aria-label="文化专题入口"
    >
      <div className="dock-section dock-routes">
        <DockHeading
          title="地图浏览"
          more="主题线路"
          onClick={() => onNavigate("routes")}
        />
        <div className="dock-route-grid">
          {themeRoutes.slice(0, 3).map(route => (
            <button
              className="dock-picture"
              key={route.id}
              onClick={() => onRouteSelect(route.id)}
              aria-label={`在地图中探索${route.name}`}
            >
              <div>
                <img src={route.coverImage} alt="" loading="lazy" />
                <span>
                  <ArrowUpRight size={17} />
                </span>
              </div>
              <strong>{route.name}</strong>
              <small>{route.summary}</small>
            </button>
          ))}
        </div>
      </div>
      <div className="dock-section dock-timeline">
        <DockHeading
          title="发展脉络"
          more="完整脉络"
          onClick={() => onNavigate("timeline")}
        />
        <div className="dock-era-grid">
          {timeline.map((item, index) => (
            <button
              key={item.id}
              onClick={() => onNavigate("timeline", item.id)}
              aria-label={`浏览${item.era}`}
            >
              <span className="dock-orb">
                <img src={assetUrl("/manus-storage/" + icons[index])} alt="" />
              </span>
              <strong>{eras[index]}</strong>
              <small>{item.period}</small>
            </button>
          ))}
        </div>
      </div>
      <div className="dock-section dock-land">
        <DockHeading
          title="土地制度"
          more="九章田制"
          onClick={() => onNavigate("land")}
        />
        <div className="dock-land-grid">
          {[landItems[0], landItems[2], landItems[8]].map((item, index) => (
            <button
              key={item.id}
              onClick={() => onNavigate("land", item.id)}
              aria-label={`查看${item.name}`}
            >
              <img
                src={assetUrl(item.images[0].src)}
                alt={item.images[0].caption || item.name}
                loading="lazy"
                decoding="async"
              />
              <span>
                <small>{["溯源", "沿革", "新篇"][index]}</small>
                <strong>{["商周田制", "秦汉田制", "新中国田制"][index]}</strong>
              </span>
              <ArrowUpRight size={15} />
            </button>
          ))}
        </div>
      </div>
      <div className="dock-section dock-folk">
        <DockHeading
          title="民俗文化"
          more="全部"
          onClick={() => onNavigate("folk")}
        />
        <div className="dock-term-grid">
          {terms.map(([name, image, id]) => (
            <button
              key={id}
              onClick={() => onNavigate("solar", id)}
              aria-label={`查看${name}节气详情`}
            >
              <img
                src={assetUrl(
                  "/manus-storage/solar-terms/st-" + image + ".webp"
                )}
                alt=""
              />
              <span>{name}</span>
            </button>
          ))}
        </div>
        <div className="dock-folk-links">
          <button onClick={() => onNavigate("folk", folkItems[0].id)}>
            耕作时序
            <ChevronRight size={12} />
          </button>
          <button onClick={() => onNavigate("solar")}>
            二十四节气
            <ChevronRight size={12} />
          </button>
        </div>
      </div>
      <div className="dock-section dock-artifacts">
        <DockHeading
          title="重要文物"
          more="全部藏品"
          onClick={() => onNavigate("artifacts")}
        />
        <div className="dock-artifact-grid">
          {[
            artifactItems[1],
            artifactItems[3],
            artifactItems[4],
            artifactItems[9],
          ].map(item => (
            <button
              key={item.id}
              onClick={() => onNavigate("artifacts", item.id)}
              aria-label={`查看${item.name}`}
            >
              <img
                src={assetUrl(item.images[0].src)}
                alt={item.images[0].caption || item.name}
                loading="lazy"
                decoding="async"
              />
              <span>{item.name.split("（")[0]}</span>
              <ArrowUpRight size={16} />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
