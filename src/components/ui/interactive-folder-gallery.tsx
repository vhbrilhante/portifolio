"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/*
 * Baseado no InteractiveFolderGallery (21st.dev), adaptado para a pasta
 * em glassmorphism do Figma: fundo escuro atrás, projetos como folhas e
 * a frente da pasta em vidro fosco (backdrop-blur) por cima das folhas.
 * Comportamento original mantido: hover abre um leque, clique espalha os
 * projetos, arrastar um projeto para baixo fecha a pasta.
 */

export interface GalleryPhoto {
  id: string | number;
  image: string;
  /** nome do projeto, aparece na etiqueta da folha */
  title?: string;
  href?: string;
}

const defaultPhotos: GalleryPhoto[] = [
  { id: 1, title: "Projeto 1", image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80" },
  { id: 2, title: "Projeto 2", image: "https://images.unsplash.com/photo-1559028012-481c04fa702d?w=600&q=80" },
  { id: 3, title: "Projeto 3", image: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600&q=80" },
  { id: 4, title: "Projeto 4", image: "https://images.unsplash.com/photo-1545235617-9465d2a55698?w=600&q=80" },
  { id: 5, title: "Projeto 5", image: "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=600&q=80" },
];

export interface InteractiveFolderGalleryProps {
  photos?: GalleryPhoto[];
  folderName?: string;
  dragHintText?: string;
  className?: string;
}

/* frente da pasta: lado esquerdo mais alto, degrau para a direita (340 x 184) */
const FRONT_PATH =
  "path('M18 0 H176 Q188 0 195 9 L214 34 Q221 42 233 42 H322 Q340 42 340 60 V166 Q340 184 322 184 H18 Q0 184 0 166 V18 Q0 0 18 0 Z')";

const spring = { type: "spring", stiffness: 350, damping: 30 } as const;

export function InteractiveFolderGallery({
  photos = defaultPhotos,
  folderName = "projects",
  dragHintText = "Drag a project down to close",
  className,
}: InteractiveFolderGalleryProps) {
  const [isFolderOpen, setIsFolderOpen] = useState(false);
  const [hoverFolder, setHoverFolder] = useState(false);

  const close = () => {
    setIsFolderOpen(false);
    setHoverFolder(false);
  };

  useEffect(() => {
    if (!isFolderOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isFolderOpen]);

  const center = (photos.length - 1) / 2;

  /* aberta: grade de até 3 colunas, centralizada no painel (sem sobrepor) */
  const cols = Math.min(3, photos.length);
  const rows = Math.ceil(photos.length / cols);
  const CARD_H = 196, GAP = 20, STEP_X = 150 + GAP;
  const BASE_BOTTOM = 462; // base das folhas fechadas, em px do painel 684
  const gridTop = 342 - (rows * CARD_H + (rows - 1) * GAP) / 2 - 20;
  const openPos = (i: number) => {
    const row = Math.floor(i / cols);
    const inRow = row === rows - 1 ? photos.length - row * cols : cols;
    const col = i - row * cols;
    return {
      x: (col - (inRow - 1) / 2) * STEP_X,
      y: gridTop + row * (CARD_H + GAP) + CARD_H - BASE_BOTTOM,
    };
  };

  return (
    <div className={cn("relative size-full select-none", className)}>
      {/* clique no fundo fecha quando aberta */}
      {isFolderOpen && (
        <button aria-label="Close folder" className="absolute inset-0 z-0 cursor-default" onClick={close} />
      )}

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative w-[360px] h-[300px] translate-y-[40px]" style={{ perspective: 900 }}>
          {/* fundo da pasta */}
          <motion.div
            className="absolute left-[18px] right-[18px] top-[24px] bottom-[50px] rounded-[18px] bg-linear-to-b from-[#3a3a3a] to-[#161616] shadow-[0_20px_40px_rgba(0,0,0,0.18)]"
            animate={{ opacity: isFolderOpen ? 0 : 1, scale: isFolderOpen ? 0.92 : 1 }}
            transition={spring}
          />

          {/* projetos (folhas) */}
          <div className="absolute inset-x-0 bottom-[70px] z-10 flex justify-center">
            {photos.map((photo, i) => {
              const offset = i - center;

              const stack = {
                y: hoverFolder ? -Math.abs(offset) * 6 - 46 : -Math.abs(offset) * 3,
                x: hoverFolder ? offset * 34 : offset * 10,
                rotate: hoverFolder ? offset * 7 : offset * 3,
                scale: 1 - Math.abs(offset) * 0.03,
                zIndex: i + 10,
              };
              const open = { ...openPos(i), rotate: 0, scale: 1, zIndex: 50 };

              return (
                <motion.div
                  key={photo.id}
                  drag={isFolderOpen}
                  dragSnapToOrigin
                  onDragEnd={(_, info) => {
                    if (info.offset.y > 100 && isFolderOpen) close();
                  }}
                  className={cn(
                    "absolute bottom-0 w-[150px] h-[196px] rounded-[12px] bg-white overflow-hidden origin-bottom",
                    "shadow-[0_14px_30px_rgba(0,0,0,0.25)] ring-1 ring-black/5",
                    isFolderOpen ? "cursor-grab active:cursor-grabbing pointer-events-auto" : "pointer-events-none",
                  )}
                  initial={false}
                  animate={isFolderOpen ? open : stack}
                  whileHover={isFolderOpen ? { scale: 1.05, zIndex: 100 } : {}}
                  whileDrag={isFolderOpen ? { scale: 1.1, rotate: 5, zIndex: 150 } : {}}
                  transition={spring}
                >
                  <img src={photo.image} alt={photo.title ?? "Project"} className="h-[160px] w-full object-cover pointer-events-none" draggable={false} />
                  <div className="flex h-[36px] items-center px-3 text-[13px] text-black/80 truncate">
                    {photo.title}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* frente de vidro */}
          <motion.button
            type="button"
            aria-label={`Open ${folderName}`}
            className="absolute left-[10px] bottom-[34px] z-20 h-[184px] w-[340px] cursor-pointer pointer-events-auto outline-none"
            style={{ transformOrigin: "bottom" }}
            initial={false}
            animate={{
              opacity: isFolderOpen ? 0 : 1,
              rotateX: hoverFolder ? -22 : 0,
              y: hoverFolder ? 8 : 0,
              pointerEvents: isFolderOpen ? "none" : "auto",
            }}
            transition={spring}
            onMouseEnter={() => setHoverFolder(true)}
            onMouseLeave={() => setHoverFolder(false)}
            onFocus={() => setHoverFolder(true)}
            onBlur={() => setHoverFolder(false)}
            onClick={() => setIsFolderOpen(true)}
          >
            <div
              className="absolute inset-0 backdrop-blur-[14px] bg-linear-to-b from-[rgba(120,120,120,0.35)] via-[rgba(70,70,70,0.55)] to-[rgba(25,25,25,0.92)]"
              style={{ clipPath: FRONT_PATH }}
            />
            {/* brilho na borda superior do vidro */}
            <div
              className="absolute inset-0 bg-linear-to-b from-white/25 via-transparent to-transparent"
              style={{ clipPath: FRONT_PATH, maskImage: "linear-gradient(to bottom, black 0, transparent 30px)" }}
            />
            <span className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-black/35 px-4 py-1.5 text-[13px] tracking-wide text-white/90 backdrop-blur-md">
              {folderName}
            </span>
          </motion.button>
        </div>
      </div>

      <motion.div
        initial={false}
        animate={{ opacity: isFolderOpen ? 1 : 0, y: isFolderOpen ? 0 : 20 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-black/10 bg-black/5 px-5 py-2 text-[12px] uppercase tracking-widest text-black/50 backdrop-blur-md pointer-events-none"
      >
        {dragHintText}
      </motion.div>
    </div>
  );
}

export { InteractiveFolderGallery as Component };
