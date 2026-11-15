import { useEffect, useRef, useState, type ReactNode } from "react"
import { cn } from "@/lib/utils"

/**
 * Regra das marcas inline (logo ou foto à direita da palavra):
 * - altura = altura da letra maiúscula da fonte (unidade CSS `cap`), nunca maior;
 * - apoiada na linha de base, então fica na mesma linha do texto;
 * - tudo em `em`/`cap`: se o tamanho ou a fonte mudar, a marca acompanha.
 */
const markBox =
  "inline-block h-[0.72em] h-[1cap] align-baseline ml-[0.22em] shrink-0"

interface InlineMarkProps {
  children: ReactNode
  src: string
  /** descrição da logo, lida por leitor de tela */
  alt?: string
  href?: string
  className?: string
}

export function InlineMark({ children, src, alt = "", href, className }: InlineMarkProps) {
  const content = (
    <>
      {children}
      <img src={src} alt={alt} className={cn(markBox, "w-auto")} draggable={false} />
    </>
  )
  // nowrap: a logo nunca cai sozinha para a linha de baixo
  const cls = cn("whitespace-nowrap", className)
  return href ? (
    <a href={href} className={cls}>{content}</a>
  ) : (
    <span className={cls}>{content}</span>
  )
}

interface PhotoMarkProps {
  thumb: string
  full: string
  alt: string
  /** largura da foto ampliada, em px */
  width?: number
  className?: string
}

/** Quadradinho com foto que segue a mesma regra e amplia no hover/foco/toque. */
export function PhotoMark({ thumb, full, alt, width = 240, className }: PhotoMarkProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const [open, setOpen] = useState(false)
  const [up, setUp] = useState(false)

  const place = () => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const h = (width * 16) / 9
    setUp(r.top + h > window.innerHeight - 16 && r.bottom - h > 16)
  }

  useEffect(() => {
    if (!open) return
    const close = (e: Event) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("pointerdown", close)
    return () => document.removeEventListener("pointerdown", close)
  }, [open])

  return (
    <span
      ref={ref}
      tabIndex={0}
      role="button"
      aria-label={alt}
      aria-expanded={open}
      onMouseEnter={place}
      onFocus={place}
      onClick={() => { place(); setOpen((o) => !o) }}
      onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
      data-open={open}
      className={cn(
        "group relative inline-block aspect-square h-[0.72em] h-[1cap] align-baseline ml-[0.22em] cursor-zoom-in outline-none",
        className,
      )}
    >
      <img src={thumb} alt="" className="block size-full rounded-[3px] object-cover" draggable={false} />
      <img
        src={full}
        alt={alt}
        style={{ width }}
        className={cn(
          "pointer-events-none absolute left-0 z-30 aspect-[9/16] max-w-none rounded-[14px] object-cover opacity-0",
          "shadow-[0_18px_40px_rgba(0,0,0,0.22),0_2px_6px_rgba(0,0,0,0.12)]",
          "scale-[0.08] transition-[transform,opacity] duration-300 ease-[cubic-bezier(.2,.8,.2,1)]",
          "group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100",
          "group-data-[open=true]:scale-100 group-data-[open=true]:opacity-100",
          "motion-reduce:scale-100 motion-reduce:transition-opacity",
          up ? "bottom-0 origin-bottom-left" : "top-0 origin-top-left",
        )}
      />
    </span>
  )
}
