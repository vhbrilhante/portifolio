"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { XIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { sfx } from "@/lib/sfx";

/*
 * Baseado no InteractiveFolderGallery (21st.dev), adaptado para a pasta em
 * glassmorphism do Figma. Hover: as folhas saem em leque. Clique: como no
 * jrl.design, os projetos "voam" para fora da pasta e viram uma coluna de
 * cards grandes no painel, que dá para rolar. Fecha no X, no Esc ou
 * clicando fora dos cards.
 *
 * O painel tem 684 x 684 (medida do Figma); quem usa escala o todo.
 */

export interface GalleryPhoto {
  id: string | number;
  image: string;
  /** nome do projeto */
  title?: string;
  /** uma linha sobre o projeto (texto fraco) */
  description?: string;
  href?: string;
}

const defaultPhotos: GalleryPhoto[] = [
  { id: 1, title: "Projeto 1", image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=900&q=80" },
  { id: 2, title: "Projeto 2", image: "https://images.unsplash.com/photo-1559028012-481c04fa702d?w=900&q=80" },
  { id: 3, title: "Projeto 3", image: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=900&q=80" },
];

export interface InteractiveFolderGalleryProps {
  photos?: GalleryPhoto[];
  folderName?: string;
  className?: string;
}

/* frente da pasta: lado esquerdo mais alto, degrau para a direita (340 x 184) */
const FRONT_PATH =
  "path('M18 0 H176 Q188 0 195 9 L214 34 Q221 42 233 42 H322 Q340 42 340 60 V166 Q340 184 322 184 H18 Q0 184 0 166 V18 Q0 0 18 0 Z')";

const spring = { type: "spring", stiffness: 350, damping: 30 } as const;

/* geometria do painel (px) */
const STAGE = 684;
const FOLDER_CARD_CENTER_Y = 364; // centro das folhas dentro da pasta
const LIST_W = 560, LIST_IMG_H = 300, LIST_CARD_H = LIST_IMG_H + 64, LIST_GAP = 24, LIST_TOP = 72;

export function InteractiveFolderGallery({
  photos = defaultPhotos,
  folderName = "projects",
  className,
}: InteractiveFolderGalleryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoverFolder, setHoverFolder] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const open = () => {
    sfx.whoosh();
    setIsOpen(true);
  };
  const close = () => {
    sfx.click();
    setIsOpen(false);
    setHoverFolder(false);
  };

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  const center = (photos.length - 1) / 2;

  return (
    <div className={cn("relative size-full select-none", className)}>
      {/* ---------------- pasta ---------------- */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={false}
        animate={{ opacity: isOpen ? 0 : 1, scale: isOpen ? 0.85 : 1, y: isOpen ? 60 : 0 }}
        transition={spring}
        style={{ pointerEvents: isOpen ? "none" : "auto" }}
      >
        <div className="relative w-[360px] h-[300px] translate-y-[40px]" style={{ perspective: 900 }}>
          {/* fundo da pasta */}
          <div className="absolute left-[18px] right-[18px] top-[24px] bottom-[50px] rounded-[18px] bg-linear-to-b from-[#3a3a3a] to-[#161616] shadow-[0_20px_40px_rgba(0,0,0,0.18)]" />

          {/* folhas */}
          <div className="absolute inset-x-0 bottom-[70px] z-10 flex justify-center pointer-events-none">
            {photos.slice(0, 5).map((photo, i, arr) => {
              const offset = i - (arr.length - 1) / 2;
              return (
                <motion.div
                  key={photo.id}
                  className="absolute bottom-0 w-[150px] h-[196px] rounded-[12px] bg-white overflow-hidden origin-bottom shadow-[0_14px_30px_rgba(0,0,0,0.25)] ring-1 ring-black/5"
                  initial={false}
                  animate={{
                    y: hoverFolder ? -Math.abs(offset) * 6 - 46 : -Math.abs(offset) * 3,
                    x: hoverFolder ? offset * 34 : offset * 10,
                    rotate: hoverFolder ? offset * 7 : offset * 3,
                    scale: 1 - Math.abs(offset) * 0.03,
                  }}
                  transition={spring}
                  style={{ zIndex: i + 10 }}
                >
                  <img src={photo.image} alt="" className="h-[160px] w-full object-cover" draggable={false} />
                  <div className="flex h-[36px] items-center px-3 text-[13px] text-black/80 truncate">{photo.title}</div>
                </motion.div>
              );
            })}
          </div>

          {/* frente de vidro */}
          <motion.button
            type="button"
            aria-label={`Open ${folderName}`}
            className="absolute left-[10px] bottom-[34px] z-20 h-[184px] w-[340px] cursor-pointer outline-none focus-visible:[&>span]:ring-2 focus-visible:[&>span]:ring-brand"
            style={{ transformOrigin: "bottom" }}
            initial={false}
            animate={{ rotateX: hoverFolder ? -22 : 0, y: hoverFolder ? 8 : 0 }}
            transition={spring}
            onMouseEnter={() => setHoverFolder(true)}
            onMouseLeave={() => setHoverFolder(false)}
            onFocus={() => setHoverFolder(true)}
            onBlur={() => setHoverFolder(false)}
            onClick={open}
            data-sfx="self"
          >
            <div
              className="absolute inset-0 backdrop-blur-[14px] bg-linear-to-b from-[rgba(120,120,120,0.35)] via-[rgba(70,70,70,0.55)] to-[rgba(25,25,25,0.92)]"
              style={{ clipPath: FRONT_PATH }}
            />
            <div
              className="absolute inset-0 bg-linear-to-b from-white/25 via-transparent to-transparent"
              style={{ clipPath: FRONT_PATH, maskImage: "linear-gradient(to bottom, black 0, transparent 30px)" }}
            />
            <span className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-black/35 px-4 py-1.5 text-[13px] tracking-wide text-white/90 backdrop-blur-md">
              {folderName} · {photos.length}
            </span>
          </motion.button>
        </div>
      </motion.div>

      {/* ---------------- projetos lançados ---------------- */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="list"
            ref={listRef}
            className="absolute inset-0 overflow-y-auto overscroll-contain [scrollbar-width:thin]"
            onClick={(e) => e.target === e.currentTarget && close()}
            initial={{ opacity: 1 }}
            exit={{ opacity: 1, transition: { duration: 0.45 } }}
          >
            <div
              className="relative mx-auto"
              style={{ width: LIST_W, height: LIST_TOP + photos.length * (LIST_CARD_H + LIST_GAP) + 40 }}
              onClick={(e) => e.target === e.currentTarget && close()}
            >
              {photos.map((p, i) => {
                const top = LIST_TOP + i * (LIST_CARD_H + LIST_GAP);
                const fromY = FOLDER_CARD_CENTER_Y - (top + LIST_CARD_H / 2);
                const fromX = (i - center) * 10;
                const from = { x: fromX, y: fromY, scale: 150 / LIST_W, rotate: (i - center) * 4, opacity: 0 };
                const Card = p.href ? motion.a : motion.div;
                return (
                  <Card
                    key={p.id}
                    {...(p.href ? { href: p.href, target: "_blank", rel: "noreferrer" } : {})}
                    className="group absolute left-0 block w-full overflow-hidden rounded-[18px] bg-paper ring-1 ring-line shadow-[0_18px_40px_rgba(0,0,0,0.12)]"
                    style={{ top, height: LIST_CARD_H }}
                    initial={from}
                    animate={{ x: 0, y: 0, scale: 1, rotate: 0, opacity: 1, transition: { type: "spring", stiffness: 140, damping: 20, mass: 0.9, delay: 0.09 * i } }}
                    exit={{ ...from, transition: { duration: 0.32, ease: [0.4, 0, 0.2, 1], delay: 0.03 * (photos.length - 1 - i) } }}
                    whileHover={{ y: -4 }}
                  >
                    <img src={p.image} alt="" className="block w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" style={{ height: LIST_IMG_H }} draggable={false} />
                    <div className="flex h-16 items-baseline justify-between gap-4 px-5 pt-4">
                      <span className="text-[17px] text-ink">{p.title}</span>
                      {p.description && <span className="truncate text-[15px] text-muted">{p.description}</span>}
                    </div>
                  </Card>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* fechar */}
      <AnimatePresence>
        {isOpen && (
          <motion.button
            type="button"
            aria-label="Close projects"
            onClick={close}
            data-sfx="self"
            className="absolute right-5 top-5 z-30 flex items-center gap-1.5 rounded-full bg-ink/85 px-3.5 py-2 text-[13px] text-paper backdrop-blur-md hover:bg-ink"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.25 } }}
            exit={{ opacity: 0, y: -8 }}
          >
            <XIcon size={14} weight="bold" /> close
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

export { InteractiveFolderGallery as Component };

export const FOLDER_STAGE_SIZE = STAGE;
