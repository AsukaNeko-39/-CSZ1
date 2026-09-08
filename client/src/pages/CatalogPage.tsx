import { useMemo, useState } from "react";
import { ArrowLeft, ArrowUpRight, BookOpen, Search, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { assetUrl } from "@/lib/assets";
import type { CatalogItem } from "@/data/catalog";

interface Props {
  title: string;
  introduction: string;
  items: CatalogItem[];
  onBack: () => void;
  kind: "land" | "folk" | "artifacts";
}

export function SectionHeading({
  title,
  introduction,
  onBack,
}: Pick<Props, "title" | "introduction" | "onBack">) {
  return (
    <>
      <div className="culture-subnav">
        <button onClick={onBack}>
          <ArrowLeft size={16} />
          返回地图
        </button>
        <span>{title}</span>
      </div>
      <section
        className="culture-section-hero"
        style={{
          backgroundImage: `linear-gradient(rgba(250,247,239,.38),rgba(250,247,239,.38)),url(${assetUrl("/manus-storage/artifacts-hero-bg.webp")})`,
        }}
      >
        <p className="culture-overline">湖湘农耕文化</p>
        <h1>{title}</h1>
        <p>{introduction}</p>
      </section>
    </>
  );
}

export default function CatalogPage({
  title,
  introduction,
  items,
  onBack,
  kind,
}: Props) {
  const [category, setCategory] = useState("全部");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<CatalogItem | null>(null);
  const categories = useMemo(
    () => ["全部", ...Array.from(new Set(items.map(item => item.category)))],
    [items]
  );
  const visible = useMemo(
    () =>
      items.filter(
        item =>
          (category === "全部" || item.category === category) &&
          [
            item.name,
            item.description,
            item.period,
            item.category,
            ...item.tags,
            ...item.details.map(detail => detail.value),
          ]
            .join(" ")
            .includes(query.trim())
      ),
    [items, category, query]
  );

  return (
    <main className={`culture-catalog culture-catalog--${kind}`}>
      <SectionHeading
        title={title}
        introduction={introduction}
        onBack={onBack}
      />
      <div className="culture-catalog-inner">
        <div className="culture-filter-bar">
          <div className="culture-categories" aria-label={`${title}分类`}>
            {categories.map(name => (
              <button
                key={name}
                aria-pressed={category === name}
                onClick={() => setCategory(name)}
              >
                {name}
              </button>
            ))}
          </div>
          <label className="culture-search">
            <Search size={16} />
            <input
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder={`搜索${title}`}
              aria-label={`搜索${title}`}
            />
          </label>
        </div>
        <div className="culture-result-count" role="status">
          共 {visible.length} {kind === "artifacts" ? "件文物" : "项内容"}
        </div>
        <div className="culture-cards">
          {visible.map((item, index) => (
            <button
              key={item.id}
              className={`culture-card ${item.images.length ? "" : "culture-card--text"}`}
              onClick={() => setSelected(item)}
              aria-label={`查看${item.name}`}
            >
              {item.images[0] ? (
                <div className="culture-card-image">
                  <img
                    src={assetUrl(item.images[0].src)}
                    alt={item.images[0].caption}
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="culture-text-motif">
                  <BookOpen size={30} />
                  <span>{item.category}</span>
                </div>
              )}
              <div className="culture-card-body">
                <span className="culture-card-category">{item.category}</span>
                <h2>{item.name}</h2>
                {item.period && (
                  <p className="culture-card-period">{item.period}</p>
                )}
                <p className="culture-card-summary">{item.description}</p>
                <div className="culture-card-bottom">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <span>
                    阅读详情 <ArrowUpRight size={15} />
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
        {visible.length === 0 && (
          <div className="culture-empty">
            <BookOpen size={32} />
            <h2>没有找到匹配的内容</h2>
            <p>试试其他关键词，或清空筛选查看全部。</p>
            <button
              className="culture-secondary"
              onClick={() => {
                setQuery("");
                setCategory("全部");
              }}
            >
              清空筛选
            </button>
          </div>
        )}
      </div>
      <Dialog
        open={selected !== null}
        onOpenChange={open => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent
          className="culture-detail-dialog sm:max-w-4xl"
          showCloseButton={false}
        >
          {selected && (
            <>
              <DialogClose
                className="culture-dialog-close"
                aria-label="关闭详情"
              >
                <X size={20} />
              </DialogClose>
              <div className="culture-detail-heading">
                <span className="culture-overline">{selected.category}</span>
                <DialogTitle className="culture-detail-title">
                  {selected.name}
                </DialogTitle>
                <DialogDescription>
                  {selected.period || selected.category}
                </DialogDescription>
              </div>
              <div className="culture-detail-content">
                {selected.images.length > 0 && (
                  <div className="culture-detail-gallery">
                    {selected.images.map(img => (
                      <figure key={img.src}>
                        <a
                          href={assetUrl(img.src)}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`查看原图：${img.caption}`}
                        >
                          <img src={assetUrl(img.src)} alt={img.caption} />
                        </a>
                        <figcaption>
                          {img.caption}
                          <span>点击查看原图</span>
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                )}
                <section>
                  <h3>内容介绍</h3>
                  <div className="culture-prose">
                    {selected.description
                      .split("\n")
                      .filter(Boolean)
                      .map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                  </div>
                </section>
                {selected.details.map(detail => (
                  <section key={detail.label}>
                    <h3>{detail.label}</h3>
                    <p className="culture-preserve-lines">{detail.value}</p>
                  </section>
                ))}
                {selected.tags.length > 0 && (
                  <div className="culture-tags">
                    {selected.tags.map(tag => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
