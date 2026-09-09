import { ArrowRight, Sprout } from "lucide-react";
import { assetUrl } from "@/lib/assets";
import { introCopy } from "@/data/catalog";

export default function CoverPage({ onEnter }: { onEnter: () => void }) {
  return (
    <main
      className="culture-cover"
      style={{
        backgroundImage: `url(${assetUrl("/manus-storage/routes-hero-bg.webp")})`,
      }}
    >
      <div className="cover-top">
        <img src={assetUrl("/manus-storage/logo-stamp.webp")} alt="农耕文明" />
        <span>湖南省农耕文化地图</span>
      </div>
      <div className="cover-layout">
        <section className="cover-reading">
          <div className="cover-eyebrow">
            <Sprout size={20} /> 三湘四水 · 万年稻作
          </div>
          <h1>
            湖湘<span>农耕文化</span>
          </h1>
          <div className="cover-introduction">
            {introCopy.cover.map(text => (
              <p key={text}>{text}</p>
            ))}
          </div>
          <button className="culture-primary" onClick={onEnter}>
            进入文化地图 <ArrowRight size={19} />
          </button>
        </section>
        <div className="cover-art" aria-hidden="true">
          <img src={assetUrl("/manus-storage/point-ziquejie.jpg")} alt="" />
          <div className="cover-art-caption">
            <span>耕读传家</span>
            <span>崇耕善耕</span>
          </div>
          <p>小小一幅地图，展开湖湘万年农耕文明</p>
        </div>
      </div>
      <footer className="cover-footer">
        主办单位：湖南省自然资源厅　　承办单位：湖南省第三测绘院
      </footer>
    </main>
  );
}
