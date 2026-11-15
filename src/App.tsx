import { useEffect, useRef, useState, type ReactNode } from "react"
import { Check } from "lucide-react"
import { InlineMark, PhotoMark } from "@/components/ui/inline-mark"
import { InteractiveFolderGallery, type GalleryPhoto } from "@/components/ui/interactive-folder-gallery"

const asset = (name: string) => `${import.meta.env.BASE_URL}assets/${name}`

// TODO(Victor): e-mail completo e link do LinkedIn
const EMAIL = "vhbrilhante@"
const LINKEDIN = "#"

const NAV = [
  { label: "skills", href: "#skills" },
  { label: "blog", href: "#blog" },
  { label: "github", href: "https://github.com/vhbrilhante" },
  { label: "arts", href: "#arts" },
]

// Projetos da pasta: imagens de exemplo até entrarem os projetos reais
const PROJECTS: GalleryPhoto[] = [
  { id: 1, title: "Atlas", image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80" },
  { id: 2, title: "Foccodoggo", image: "https://images.unsplash.com/photo-1559028012-481c04fa702d?w=600&q=80" },
  { id: 3, title: "Redes lab", image: "https://images.unsplash.com/photo-1545235617-9465d2a55698?w=600&q=80" },
  { id: 4, title: "UI study", image: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600&q=80" },
  { id: 5, title: "Arts", image: "https://images.unsplash.com/photo-1541462608143-67571c6738dd?w=600&q=80" },
]

/** Mantém a cena da pasta em 684 x 684 (medida do Figma) e escala para caber. */
function ScaledStage({ size = 684, children }: { size?: number; children: ReactNode }) {
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
    <div ref={ref} className="relative aspect-square w-full max-w-[684px] bg-panel">
      <div className="absolute left-0 top-0 origin-top-left" style={{ width: size, height: size, transform: `scale(${scale})` }}>
        {children}
      </div>
    </div>
  )
}

function CopyEmail() {
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
      className="ml-[0.22em] mr-[0.18em] inline-block h-[1cap] w-[1cap] align-baseline text-black/70 hover:text-black"
    >
      {copied ? <Check className="size-full" strokeWidth={2.5} /> : <img src={asset("copy.svg")} alt="" className="block size-full" />}
    </button>
  )
}

const dotted = "underline decoration-dotted decoration-[0.1em] underline-offset-[0.2em] [text-decoration-skip-ink:none] hover:decoration-solid"

export default function App() {
  return (
    <div className="min-h-dvh px-4 pb-24 pt-10 md:px-10 min-[1180px]:pt-[54px]">
      <div className="mx-auto grid max-w-[1255px] grid-cols-1 gap-x-[84px] min-[1180px]:grid-cols-[487px_684px]">
        {/* topo: logo + menu */}
        <header className="col-span-full grid grid-cols-subgrid items-start">
          <a href="#" aria-label="Home" className="mt-1 block h-[37px] w-[43px] rotate-180">
            <img src={asset("vh-logo.svg")} alt="vh" width={43} height={37} />
          </a>
          <nav className="hidden min-[1180px]:flex gap-[46px] text-[24px] leading-[34px]">
            {NAV.map((n) => (
              <a key={n.label} href={n.href} className="hover:underline underline-offset-4">{n.label}</a>
            ))}
          </nav>
        </header>

        {/* coluna do texto */}
        <main className="pt-10 min-[1180px]:pt-[39px]">
          <p className="text-[24px] leading-[34px]">hi! It’ s pleasure</p>
          <h1 className="font-display text-[32px] leading-[46px] whitespace-nowrap">
            Victor Hugo Brilhante
            <PhotoMark thumb={asset("foto-victor-thumb.jpg")} full={asset("foto-victor-full.jpg")} alt="Photo of Victor" />
          </h1>
          <p className="text-[24px] leading-[34px]">ux/ui junior</p>

          <div className="mt-[22px] space-y-[26px] text-[22px] leading-[1.42]">
            <p>
              Currently UI/UX and Marketing Lead at{" "}
              <InlineMark src={asset("atlas.svg")} alt="Atlas logo">Atlas</InlineMark>, my college’s junior
              company. Also a network intern at{" "}
              <InlineMark src={asset("seduc.png")} alt="Rondônia coat of arms">SEDUC</InlineMark> Rondônia.
            </p>
            <p>Designing screens, flows and interfaces that feel simple, clear and intentional.</p>
            <p>
              Started with newspaper collages as a kid, moved to{" "}
              <InlineMark src={asset("photoshop.png")} alt="Photoshop logo">Photoshop</InlineMark> on a phone at 15,
              and found Figma in college. Now halfway through a Computer Science degree, so I design with how
              things get built in mind.
            </p>
            <p>
              reach me at <a href={`mailto:${EMAIL}`} className={dotted}>{EMAIL}</a>
              <CopyEmail /> or <a href={LINKEDIN} className={dotted}>linkedin</a>
            </p>
          </div>

          <nav className="mt-10 flex flex-wrap gap-x-8 gap-y-2 text-[22px] min-[1180px]:hidden">
            {NAV.map((n) => (
              <a key={n.label} href={n.href} className={dotted}>{n.label}</a>
            ))}
          </nav>
        </main>

        {/* coluna da pasta */}
        <section aria-label="Projects" className="mt-12 min-[1180px]:mt-[12px]">
          <ScaledStage>
            <InteractiveFolderGallery photos={PROJECTS} folderName="projects" />
          </ScaledStage>
        </section>
      </div>
    </div>
  )
}
