import { useEffect, useRef, useState, type ReactNode } from "react"
import { CheckIcon, CopyIcon } from "@phosphor-icons/react"
import { CareerTimeline } from "@/components/ui/career-timeline"
import { InlineMark, PhotoMark } from "@/components/ui/inline-mark"
import { InteractiveFolderGallery, FOLDER_STAGE_SIZE } from "@/components/ui/interactive-folder-gallery"
import { Hand, Marker, Pill, SectionLabel, Strong } from "@/components/ui/text-fx"
import { LocalClock, Toolbar } from "@/components/ui/toolbar"
import { installGlobalSfx } from "@/lib/sfx"
import { asset, CAREER, CLOCK, DEGREE_PROGRESS, EMAIL, GITHUB, LINKEDIN, NAV, PROJECTS } from "@/content"
import Resume from "@/pages/Resume"

/** Mantém a cena da pasta em 684 x 684 (medida do Figma) e escala para caber. */
function ScaledStage({ size = FOLDER_STAGE_SIZE, children }: { size?: number; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setScale(Math.min(1, e.contentRect.width / size)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [size])
  return (
    <div ref={ref} className="relative aspect-square w-full max-w-[684px] overflow-hidden rounded-[28px] bg-panel transition-colors duration-300">
      <div className="absolute left-0 top-0 origin-top-left" style={{ width: size, height: size, transform: `scale(${scale})` }}>
        {children}
      </div>
    </div>
  )
}

export function CopyEmail() {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      aria-label="Copy e-mail"
      onClick={async () => {
        try { await navigator.clipboard.writeText(EMAIL) } catch { /* sem permissão: ignora */ }
        setCopied(true)
        setTimeout(() => setCopied(false), 1400)
      }}
      className="ml-[0.25em] mr-[0.15em] inline-block size-[1em] align-[-0.15em] cursor-pointer text-muted transition-colors hover:text-ink"
    >
      {copied ? <CheckIcon className="block size-full" weight="bold" /> : <CopyIcon className="block size-full" />}
    </button>
  )
}

export const dotted =
  "text-ink underline decoration-dotted decoration-[0.1em] underline-offset-[0.2em] [text-decoration-skip-ink:none] hover:decoration-solid"

function useHashRoute() {
  const [hash, setHash] = useState(() => window.location.hash)
  useEffect(() => {
    const on = () => { setHash(window.location.hash); window.scrollTo(0, 0) }
    window.addEventListener("hashchange", on)
    return () => window.removeEventListener("hashchange", on)
  }, [])
  return hash
}

export function SiteHeader() {
  return (
    <header className="col-span-full grid grid-cols-subgrid items-start">
      <a href="#" aria-label="Home" className="mt-1 block h-[37px] w-[43px]">
        <img src={asset("vh-logo.svg")} alt="vh" width={43} height={37} />
      </a>
      <div className="hidden items-center justify-between min-[1180px]:flex">
        <nav className="flex gap-[32px] text-[24px] leading-[34px]">
          {NAV.map((n) => (
            <a key={n.label} href={n.href} className="hover:underline underline-offset-4">{n.label}</a>
          ))}
        </nav>
        <Toolbar />
      </div>
    </header>
  )
}

function Home() {
  return (
    <>
      {/* coluna do texto */}
      <main className="pt-10 min-[1180px]:pt-[39px]">
        <p className="text-[24px] leading-[34px] text-muted">hi! It’ s pleasure</p>
        <h1 className="font-display text-[32px] leading-[46px] whitespace-nowrap">
          Victor Hugo Brilhante
          <PhotoMark thumb={asset("foto-victor-thumb.jpg")} full={asset("foto-victor-full.jpg")} alt="Photo of Victor" />
        </h1>
        <p className="text-[24px] leading-[34px] text-muted">ux/ui junior</p>

        <div className="mt-[22px] space-y-[26px] text-[22px] leading-[1.5] text-muted">
          <p>
            Currently <Strong>UI/UX and Marketing Lead</Strong> at{" "}
            <InlineMark src={asset("atlas.svg")} alt="Atlas logo" className="text-ink">Atlas</InlineMark>, my college’s junior
            company. Also a <Strong>network intern</Strong> at{" "}
            <InlineMark src={asset("seduc.png")} alt="Rondônia coat of arms" className="text-ink">SEDUC</InlineMark> Rondônia.
          </p>
          <p>
            Designing screens, flows and interfaces that feel <Marker className="text-ink">simple, clear and intentional</Marker>.
          </p>
          <p>
            Started with <Hand>newspaper collages</Hand> as a kid, moved to{" "}
            <InlineMark src={asset("photoshop.png")} alt="Photoshop logo" className="text-ink">Photoshop</InlineMark>{" "}
            <Pill>on a phone</Pill> at 15, and found{" "}
            <InlineMark src={asset("figma.svg")} alt="Figma logo" className="text-ink">Figma</InlineMark> in college. Now{" "}
            <Strong>halfway</Strong> through a Computer Science degree, so I design with how things get built in mind.
          </p>
          <p>
            reach me at <a href={`mailto:${EMAIL}`} className={dotted}>{EMAIL}</a>
            <CopyEmail /> or <a href={LINKEDIN} className={dotted}>linkedin</a>
          </p>
        </div>

        {/* menu + botões no celular */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 min-[1180px]:hidden">
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-[20px]">
            {NAV.map((n) => <a key={n.label} href={n.href} className={dotted}>{n.label}</a>)}
          </nav>
          <Toolbar />
        </div>
      </main>

      {/* coluna da pasta */}
      <section aria-label="Projects" className="mt-12 min-[1180px]:mt-[12px]">
        <ScaledStage>
          <InteractiveFolderGallery photos={PROJECTS} folderName="projects" />
        </ScaledStage>
        <div className="mt-3 flex justify-between px-1">
          <span className="text-[15px] text-muted">click the folder to open</span>
          <LocalClock {...CLOCK} />
        </div>
      </section>

      {/* carreira */}
      <section aria-label="Career" className="col-span-full mt-20">
        <SectionLabel className="mb-6">career · now → graduation</SectionLabel>
        <CareerTimeline
          items={CAREER}
          progress={0.25 + DEGREE_PROGRESS * 0.5}
          allHref="#/resume"
          caption={<><span className="text-ink">{Math.round(DEGREE_PROGRESS * 100)}%</span> of the Computer Science degree done · graduating in 2028</>}
        />
      </section>

      {/* contato */}
      <section aria-label="Connect" className="col-span-full mt-16">
        <SectionLabel className="mb-4">connect</SectionLabel>
        <ul className="grid gap-x-10 gap-y-3 text-[17px] sm:grid-cols-4">
          {[
            { v: EMAIL, l: "Email", h: `mailto:${EMAIL}` },
            { v: "vhbrilhante", l: "GitHub", h: GITHUB },
            { v: "linkedin", l: "LinkedIn", h: LINKEDIN },
            { v: "resume", l: "CV", h: "#/resume" },
          ].map((c) => (
            <li key={c.l}>
              <a href={c.h} className="group flex items-baseline justify-between gap-3 border-b border-line pb-2">
                <span className="text-ink group-hover:underline underline-offset-4">{c.v}</span>
                <span className="text-[15px] text-muted">{c.l}</span>
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-10 text-[13px] text-muted">© {new Date().getFullYear()} Victor Hugo Brilhante</p>
      </section>
    </>
  )
}

export default function App() {
  const hash = useHashRoute()
  useEffect(() => installGlobalSfx(), [])
  const isResume = hash.startsWith("#/resume")
  return (
    <div className="min-h-dvh px-4 pb-16 pt-10 md:px-10 min-[1180px]:pt-[54px]">
      <div className="mx-auto grid max-w-[1255px] grid-cols-1 gap-x-[84px] min-[1180px]:grid-cols-[487px_684px]">
        <SiteHeader />
        {isResume ? <Resume /> : <Home />}
      </div>
    </div>
  )
}
