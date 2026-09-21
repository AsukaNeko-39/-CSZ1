import {
  BookOpen,
  History,
  Landmark,
  MapPinned,
  Sprout,
  Search,
  Share2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { assetUrl } from "@/lib/assets";
import { getWelcomeUrl } from "@/lib/navigation";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

interface HeaderProps {
  activeNav: string;
  onNavChange: (nav: string) => void;
  onSearch: (query: string) => void;
}

const navItems = [
  { id: "map", label: "地图浏览", desktopLabel: "地图浏览", icon: MapPinned },
  {
    id: "timeline",
    label: "发展脉络",
    desktopLabel: "发展脉络",
    icon: History,
  },
  { id: "land", label: "土地制度", desktopLabel: "土地制度", icon: BookOpen },
  { id: "folk", label: "民俗文化", desktopLabel: "民俗文化", icon: Sprout },
  {
    id: "artifacts",
    label: "重要文物",
    desktopLabel: "重要文物",
    icon: Landmark,
  },
];

export default function Header({
  activeNav,
  onNavChange,
  onSearch,
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [logoFailed, setLogoFailed] = useState(false);
  const [manualShareUrl, setManualShareUrl] = useState("");

  const handleShare = async () => {
    const url = getWelcomeUrl(window.location.href);
    try {
      await navigator.clipboard.writeText(url);
      toast("欢迎页链接已复制", {
        description: "发给对方后，将从欢迎页开始浏览",
      });
    } catch {
      setManualShareUrl(url);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top navigation - museum atlas header */}
      <div
        className="border-b border-gold/15"
        style={{
          background: "linear-gradient(180deg, #faf6ee 0%, #f6f1e8 100%)",
        }}
      >
        <div className="mobile-safe-top flex min-w-0 items-center justify-between gap-2 px-3 sm:px-5 h-[54px] lg:h-[56px]">
          {/* Brand area - seal + literary title */}
          <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3.5">
            <button
              type="button"
              onClick={() => onNavChange("cover")}
              aria-label="返回封面"
              className="w-9 h-9 sm:w-11 sm:h-11 flex-shrink-0 relative logo-stamp-shell"
            >
              {logoFailed ? (
                <span className="logo-stamp-fallback">
                  农<br />耕
                </span>
              ) : (
                <img
                  src={assetUrl("/manus-storage/logo-stamp.webp")}
                  alt="农耕文明"
                  className="w-full h-full object-contain drop-shadow-sm"
                  onError={() => setLogoFailed(true)}
                />
              )}
            </button>
            <div className="min-w-0 border-l border-gold/20 pl-2.5 sm:pl-3.5">
              <h1
                className="truncate whitespace-nowrap text-[14px] sm:text-[17px] font-bold font-serif tracking-[0.06em] sm:tracking-[0.15em] leading-tight"
                style={{ color: "#3d2e0a" }}
              >
                湖南省农耕文化地图
              </h1>
              <p
                className="hidden sm:block truncate whitespace-nowrap text-[12px] tracking-[0.08em] mt-0.5"
                style={{ color: "#6f5b39" }}
              >
                小小一幅地图，展开湖湘万年农耕文明
              </p>
            </div>
          </div>

          {/* Navigation - refined literary tabs */}
          <nav className="hidden lg:flex items-center gap-0">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => onNavChange(item.id)}
                className={`px-3 xl:px-5 py-2 text-[15px] font-medium font-serif tracking-wide transition-all duration-250 relative ${
                  activeNav === item.id
                    ? "text-[#3d2e0a]"
                    : "text-[#6f5b39] hover:text-[#5c4a1e]"
                }`}
              >
                {item.desktopLabel}
                {activeNav === item.id && (
                  <span
                    className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-5 h-[2px] rounded-full"
                    style={{ background: "#8B6914" }}
                  />
                )}
              </button>
            ))}
          </nav>

          {/* Search and share - archival controls */}
          <div className="flex flex-shrink-0 items-center gap-2.5">
            <form
              onSubmit={handleSearch}
              className="hidden lg:flex items-center"
            >
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="搜索点位、遗址、主题..."
                  className="w-36 xl:w-48 h-8 pl-3 pr-8 text-[14px] bg-white/60 border border-gold/15 rounded focus:outline-none focus:border-gold/40 focus:ring-1 focus:ring-gold/15 placeholder:text-[#806c4c] font-serif"
                  style={{ borderRadius: "3px" }}
                />
                <button
                  type="submit"
                  aria-label="搜索地图点位"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#806c4c] hover:text-gold-dark transition-colors"
                >
                  <Search size={14} />
                </button>
              </div>
            </form>
            <button
              aria-label="分享"
              onClick={handleShare}
              className="flex w-10 h-10 lg:w-auto lg:h-auto items-center justify-center gap-1.5 px-2.5 sm:px-3.5 lg:py-1.5 text-[14px] font-medium font-serif border rounded hover:shadow-sm transition-all duration-200 active:scale-97"
              style={{
                color: "#5c4a1e",
                borderColor: "rgba(139,105,20,0.25)",
                borderRadius: "3px",
              }}
            >
              <Share2 size={13} />
              <span className="hidden sm:inline">分享</span>
            </button>
          </div>
        </div>
      </div>

      {/* Compact navigation - large touch targets, always available below desktop */}
      <nav
        className="lg:hidden grid grid-cols-5 h-[50px] border-b border-gold/10 px-1"
        style={{
          background: "rgba(255,253,248,0.94)",
          backdropFilter: "blur(12px)",
        }}
        aria-label="移动端主导航"
      >
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavChange(item.id)}
              aria-current={isActive ? "page" : undefined}
              className={`relative flex min-w-0 flex-col items-center justify-center gap-0.5 rounded-md font-serif transition-colors ${
                isActive ? "text-[#5c4310]" : "text-[#6f5b39]"
              }`}
            >
              <Icon size={16} strokeWidth={isActive ? 2 : 1.6} />
              <span className="text-[12px] leading-none">{item.label}</span>
              {isActive && (
                <span className="absolute bottom-0.5 h-0.5 w-5 rounded-full bg-[#8B6914]" />
              )}
            </button>
          );
        })}
      </nav>

      <Dialog
        open={!!manualShareUrl}
        onOpenChange={open => {
          if (!open) setManualShareUrl("");
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="z-[1200] border-gold/20 bg-[#faf6ee] font-serif"
        >
          <DialogTitle>分享网站</DialogTitle>
          <DialogDescription>
            请长按或选中下方链接复制，发送给对方后将从欢迎页开始浏览。
          </DialogDescription>
          <input
            aria-label="网站欢迎页链接"
            value={manualShareUrl}
            readOnly
            onFocus={event => event.currentTarget.select()}
            className="w-full min-w-0 rounded border border-gold/25 bg-white p-3 text-sm text-[#5c4a1e]"
          />
          <DialogClose className="justify-self-end rounded border border-gold/25 px-4 py-2 text-sm">
            关闭
          </DialogClose>
        </DialogContent>
      </Dialog>
    </header>
  );
}
