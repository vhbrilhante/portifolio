import { useEffect, useState } from "react"
import { CheckIcon, LinkSimpleIcon, MoonIcon, SpeakerHighIcon, SpeakerSlashIcon, SunIcon } from "@phosphor-icons/react"
import { useSfxEnabled } from "@/hooks/use-sfx"
import { useTheme } from "@/hooks/use-theme"
import { cn } from "@/lib/utils"

const iconBtn =
  "grid size-8 place-items-center rounded-md text-muted transition-colors hover:bg-chip hover:text-ink focus-visible:outline-2 focus-visible:outline-brand"

/** Relógio local (estilo ch.sh): mostra a hora do Victor para quem quiser contatar. */
export function LocalClock({ timeZone, place, className }: { timeZone: string; place: string; className?: string }) {
  const fmt = () =>
    new Intl.DateTimeFormat("en-GB", { timeZone, hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date())
  const [now, setNow] = useState(fmt)
  useEffect(() => {
    const id = setInterval(() => setNow(fmt()), 1000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeZone])
  return (
    <span className={cn("text-[15px] text-muted tabular-nums whitespace-nowrap", className)} title={`Local time in ${place}`}>
      {place} <span className="text-ink">{now}</span>
    </span>
  )
}

export function Toolbar({ className }: { className?: string }) {
  const { dark, toggle } = useTheme()
  const [sound, setSound] = useSfxEnabled()
  const [copied, setCopied] = useState(false)

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <button
        type="button"
        className={iconBtn}
        aria-label="Copy page link"
        title="Copy page link"
        onClick={async () => {
          try { await navigator.clipboard.writeText(window.location.href) } catch { /* sem permissão */ }
          setCopied(true)
          setTimeout(() => setCopied(false), 1400)
        }}
      >
        {copied ? <CheckIcon size={18} weight="bold" /> : <LinkSimpleIcon size={18} />}
      </button>
      <button
        type="button"
        className={iconBtn}
        aria-label={sound ? "Turn sounds off" : "Turn sounds on"}
        aria-pressed={sound}
        title={sound ? "Sounds on" : "Sounds off"}
        data-sfx="self"
        onClick={() => setSound(!sound)}
      >
        {sound ? <SpeakerHighIcon size={18} /> : <SpeakerSlashIcon size={18} />}
      </button>
      <button
        type="button"
        className={iconBtn}
        aria-label={dark ? "Light theme" : "Dark theme"}
        title={dark ? "Light theme" : "Dark theme"}
        onClick={toggle}
      >
        {dark ? <SunIcon size={18} /> : <MoonIcon size={18} />}
      </button>
    </div>
  )
}
