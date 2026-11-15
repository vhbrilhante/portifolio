import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

/*
 * Brincadeiras no texto (estilo antwi.dev). Todas herdam o tamanho da fonte,
 * então funcionam dentro de qualquer parágrafo.
 */

/** Marca-texto pintado à mão atrás das palavras. */
export function Marker({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "relative -mx-[0.1em] px-[0.1em] [box-decoration-break:clone] [-webkit-box-decoration-break:clone]",
        "bg-[linear-gradient(104deg,transparent_0.3em,rgba(255,196,0,.55)_0.4em,rgba(255,196,0,.4)_96%,transparent_100%)]",
        "bg-[length:100%_0.62em] bg-[position:0_88%] bg-no-repeat",
        className,
      )}
    >
      {children}
    </span>
  )
}

/** Etiqueta colorida (pílula), como "Scratch games" no antwi. */
export function Pill({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-block -rotate-1 rounded-[0.3em] bg-brand px-[0.35em] py-[0.02em] text-[0.92em] leading-[1.25] text-white shadow-[0_2px_0_rgba(0,0,0,.18)]",
        className,
      )}
    >
      {children}
    </span>
  )
}

/** Trecho escrito à mão. */
export function Hand({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("font-hand mr-[0.12em] text-[1.28em] leading-[0.8] text-brand", className)}>{children}</span>
}

/** Palavra forte (ch.sh): o resto do texto fica na cor fraca. */
export function Strong({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("text-ink", className)}>{children}</span>
}

/** Título de seção com linha separadora (ch.sh: "Featured ————"). */
export function SectionLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center gap-4 text-[15px] text-muted", className)}>
      <span className="shrink-0">{children}</span>
      <span aria-hidden className="h-px flex-1 border-t border-dashed border-line" />
    </div>
  )
}
