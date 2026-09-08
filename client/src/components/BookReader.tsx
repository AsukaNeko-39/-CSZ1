import { useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

/** Paginate against the actual reader box, including Chinese fonts and resized screens. */
export default function BookReader({
  text,
  title,
}: {
  text: string;
  title: string;
}) {
  const viewport = useRef<HTMLDivElement>(null);
  const measure = useRef<HTMLParagraphElement>(null);
  const [pages, setPages] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState(1);
  const reduceMotion = useReducedMotion();

  useLayoutEffect(() => {
    let alive = true;
    function paginate() {
      const box = viewport.current,
        ruler = measure.current;
      if (!alive || !box || !ruler || !box.clientWidth || !box.clientHeight)
        return;
      ruler.style.width = `${box.clientWidth}px`;
      const result: string[] = [];
      let remainder = text;
      while (remainder.length) {
        let low = 1,
          high = remainder.length,
          fit = 1;
        while (low <= high) {
          const middle = Math.floor((low + high) / 2);
          ruler.textContent = remainder.slice(0, middle);
          if (ruler.offsetHeight <= box.clientHeight - 2) {
            fit = middle;
            low = middle + 1;
          } else high = middle - 1;
        }
        // Prefer a complete sentence or paragraph without throwing away any content.
        if (fit < remainder.length) {
          const candidate = remainder.slice(0, fit);
          const breaks = Array.from(candidate.matchAll(/[。！？；\n]/g));
          const natural = breaks.at(-1)?.index;
          if (natural !== undefined && natural > fit * 0.6) fit = natural + 1;
          if (/[\uD800-\uDBFF]/.test(remainder[fit - 1])) fit--;
        }
        result.push(remainder.slice(0, fit));
        remainder = remainder.slice(fit);
      }
      ruler.textContent = "";
      setPages(previous =>
        previous.join("\u0000") === result.join("\u0000") ? previous : result
      );
      setPage(previous => Math.min(previous, Math.max(0, result.length - 1)));
    }
    const observer = new ResizeObserver(paginate);
    if (viewport.current) observer.observe(viewport.current);
    void document.fonts.ready.then(paginate);
    paginate();
    return () => {
      alive = false;
      observer.disconnect();
    };
  }, [text]);

  function turn(next: number) {
    const bounded = Math.max(0, Math.min(pages.length - 1, next));
    if (bounded === page) return;
    setDirection(bounded > page ? 1 : -1);
    setPage(bounded);
  }
  return (
    <div className="culture-reader">
      <div
        ref={viewport}
        className="reader-viewport"
        tabIndex={0}
        aria-label={`${title}分页正文`}
        onKeyDown={event => {
          if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
            event.preventDefault();
            turn(page + (event.key === "ArrowRight" ? 1 : -1));
          }
        }}
      >
        <p
          ref={measure}
          className="reader-text reader-measure"
          aria-hidden="true"
        />
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.p
            key={`${page}-${pages.length}`}
            className="reader-text reader-leaf"
            custom={direction}
            variants={{
              enter: (d: number) => ({
                opacity: 0,
                rotateY: reduceMotion ? 0 : d * 9,
                x: reduceMotion ? 0 : d * 12,
              }),
              visible: { opacity: 1, rotateY: 0, x: 0 },
              leave: (d: number) => ({
                opacity: 0,
                rotateY: reduceMotion ? 0 : -d * 9,
                x: reduceMotion ? 0 : -d * 12,
              }),
            }}
            initial="enter"
            animate="visible"
            exit="leave"
            transition={{ duration: reduceMotion ? 0 : 0.18 }}
          >
            {pages[page] || ""}
          </motion.p>
        </AnimatePresence>
      </div>
      <div className="reader-pagination">
        <button
          onClick={() => turn(page - 1)}
          disabled={page === 0}
          aria-label={`${title}上一页`}
        >
          <ChevronLeft size={16} />
          上一页
        </button>
        <span role="status">
          第 <b>{page + 1}</b> / {Math.max(1, pages.length)} 页
        </span>
        <button
          onClick={() => turn(page + 1)}
          disabled={page >= pages.length - 1}
          aria-label={`${title}下一页`}
        >
          下一页
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
