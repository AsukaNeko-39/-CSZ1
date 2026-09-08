import { ArrowUpRight, BookOpen } from "lucide-react";
import { timeline, landItems, folkItems, artifactItems } from "@/data/catalog";
import { assetUrl } from "@/lib/assets";

interface Props {
  onNavigate?: (nav: string) => void;
  onPointSelect?: (id: string) => void;
  onRouteSelect?: (id: string) => void;
}

export default function BottomModules({ onNavigate }: Props) {
  const sections = [
    {
      id: "timeline",
      title: "湖湘农耕文化发展脉络",
      items: timeline
        .slice(0, 3)
        .map(item => ({ name: item.era, image: item.image })),
    },
    {
      id: "land",
      title: "土地制度",
      items: landItems
        .slice(0, 3)
        .map(item => ({ name: item.name, image: item.images[0]?.src })),
    },
    {
      id: "folk",
      title: "民俗文化",
      items: [folkItems[0], folkItems[4], folkItems[12]].map(item => ({
        name: item.name,
        image: item.images[0]?.src,
      })),
    },
    {
      id: "artifacts",
      title: "重要文物",
      items: [artifactItems[1], artifactItems[3], artifactItems[4]].map(
        item => ({ name: item.name, image: item.images[0]?.src })
      ),
    },
  ];
  return (
    <section className="culture-bottom" aria-label="文化专题入口">
      {sections.map(section => (
        <div className="culture-bottom-section" key={section.id}>
          <button
            className="culture-bottom-heading"
            onClick={() => onNavigate?.(section.id)}
          >
            <h2>{section.title}</h2>
            <ArrowUpRight size={15} />
          </button>
          <div className="culture-bottom-items">
            {section.items.map(item => (
              <button key={item.name} onClick={() => onNavigate?.(section.id)}>
                {item.image ? (
                  <img src={assetUrl(item.image)} alt="" loading="lazy" />
                ) : (
                  <BookOpen />
                )}
                <span>{item.name}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
