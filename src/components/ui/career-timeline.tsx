import type { ReactNode } from "react"
import { motion } from "framer-motion"
import { ArrowUpRightIcon } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

/*
 * Linha do tempo da carreira (estilo gurbinder.dev): trilho com pontos,
 * preenchido até o "agora", e os marcos embaixo. O ponto do agora pulsa;
 * o futuro (formatura) fica vazado.
 */

export interface CareerItem {
  title: string
  detail: string
  date: string
  icon: ReactNode
  state: "past" | "now" | "future"
}

interface CareerTimelineProps {
  items: CareerItem[]
  /** 0 a 1: até onde o trilho fica preenchido */
  progress: number
  caption?: ReactNode
  allHref?: string
  className?: string
}

export function CareerTimeline({ items, progress, caption, allHref, className }: CareerTimelineProps) {
  const cols = items.length
  return (
    <div className={cn("w-full", className)}>
      {/* trilho (desktop/tablet) */}
      <div className="relative hidden h-5 sm:block" aria-hidden>
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 border-t border-dashed border-line" />
        <motion.div
          className="absolute left-0 top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-ink"
          initial={{ width: 0 }}
          whileInView={{ width: `${progress * 100}%` }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 1.4, ease: [0.2, 0.8, 0.2, 1] }}
        />
        {items.map((it, i) => (
          <span
            key={it.title}
            className="absolute top-1/2 -translate-y-1/2"
            style={{ left: `calc(${(i / cols) * 100}% + 4px)` }}
          >
            <Dot state={it.state} />
          </span>
        ))}
        {allHref && (
          <a href={allHref} className="absolute right-0 top-1/2 flex -translate-y-1/2 items-center gap-1 bg-paper pl-3 text-[13px] tracking-widest text-muted hover:text-ink">
            ALL <ArrowUpRightIcon size={14} weight="bold" />
          </a>
        )}
      </div>

      <ol className="mt-4 grid gap-6 sm:grid-cols-[repeat(var(--cols),minmax(0,1fr))] sm:gap-4" style={{ ["--cols" as string]: cols }}>
        {items.map((it) => (
          <li key={it.title} className="flex gap-3 sm:block">
            <span className="mt-2 sm:hidden"><Dot state={it.state} /></span>
            <div>
              <div className={cn("flex items-center gap-2 text-[19px]", it.state === "future" ? "text-muted" : "text-ink")}>
                <span className="grid size-[26px] shrink-0 place-items-center overflow-hidden rounded-md bg-chip text-ink">{it.icon}</span>
                {it.title}
              </div>
              <p className="mt-1 text-[15px] text-muted">{it.detail}</p>
              <p className="mt-0.5 font-mono text-[13px] text-muted">{it.date}</p>
            </div>
          </li>
        ))}
      </ol>
      {caption && <p className="mt-5 text-[15px] text-muted">{caption}</p>}
    </div>
  )
}

function Dot({ state }: { state: CareerItem["state"] }) {
  if (state === "now")
    return (
      <span className="relative grid size-3 place-items-center">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand/50" />
        <span className="relative size-3 rounded-full bg-brand ring-4 ring-paper" />
      </span>
    )
  return (
    <span
      className={cn(
        "block size-[10px] rounded-full ring-4 ring-paper",
        state === "past" ? "bg-ink" : "border-2 border-muted bg-paper",
      )}
    />
  )
}
