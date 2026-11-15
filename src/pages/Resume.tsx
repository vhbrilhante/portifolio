import { ArrowLeftIcon, PrinterIcon } from "@phosphor-icons/react"
import { SectionLabel } from "@/components/ui/text-fx"
import { asset, CLOCK, DEGREE_PROGRESS, EMAIL, GITHUB, LINKEDIN } from "@/content"
import { LocalClock } from "@/components/ui/toolbar"

/*
 * Aba de currículo (ideia do gurbinder.dev). Conteúdo inicial com o que já
 * está no site; "Print / PDF" usa a impressão do navegador para gerar o PDF.
 * TODO(Victor): datas de início na Atlas e na SEDUC, faculdade, mais skills.
 */
const EXPERIENCE = [
  { org: "Atlas", logo: "atlas.svg", role: "UI/UX and Marketing Lead", detail: "My college’s junior company. Screens, flows, brand and marketing.", when: "now" },
  { org: "SEDUC Rondônia", logo: "seduc.png", role: "Network intern", detail: "State education department, networking and infrastructure.", when: "now" },
]
const SKILLS = ["UI/UX design", "Figma", "Photoshop", "Design systems", "Prototyping", "Networking basics"]

export default function Resume() {
  return (
    <main className="col-span-full max-w-[760px] pt-10 min-[1180px]:pt-[39px] print:pt-0">
      <div className="flex items-center justify-between print:hidden">
        <a href="#" className="flex items-center gap-2 text-[17px] text-muted hover:text-ink"><ArrowLeftIcon size={16} /> back</a>
        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-full border border-line px-4 py-1.5 text-[15px] text-ink hover:bg-chip"
        >
          <PrinterIcon size={16} /> Print / PDF
        </button>
      </div>

      <h1 className="mt-10 font-display text-[32px] leading-[46px]">Victor Hugo Brilhante</h1>
      <p className="text-[22px] text-muted">UX/UI designer, junior · Computer Science student</p>
      <p className="mt-2 text-[15px] text-muted">
        {EMAIL} · <a href={GITHUB} className="hover:text-ink">github.com/vhbrilhante</a> · <a href={LINKEDIN} className="hover:text-ink">linkedin</a> · <LocalClock {...CLOCK} className="text-[15px]" />
      </p>

      <SectionLabel className="mt-12 mb-5">experience</SectionLabel>
      <ul className="space-y-6">
        {EXPERIENCE.map((e) => (
          <li key={e.org} className="grid grid-cols-[28px_1fr_auto] gap-x-3">
            <img src={asset(e.logo)} alt="" className="mt-1 size-[22px] rounded-[5px]" />
            <div>
              <p className="text-[19px] text-ink">{e.role} <span className="text-muted">· {e.org}</span></p>
              <p className="text-[16px] text-muted">{e.detail}</p>
            </div>
            <span className="font-mono text-[13px] text-muted">{e.when}</span>
          </li>
        ))}
      </ul>

      <SectionLabel className="mt-12 mb-5">education</SectionLabel>
      <div className="grid grid-cols-[1fr_auto] gap-x-3">
        <div>
          <p className="text-[19px] text-ink">Computer Science</p>
          <p className="text-[16px] text-muted">Bachelor’s degree, {Math.round(DEGREE_PROGRESS * 100)}% done</p>
          <div className="mt-3 h-1.5 w-full max-w-[320px] overflow-hidden rounded-full bg-chip">
            <div className="h-full rounded-full bg-brand" style={{ width: `${DEGREE_PROGRESS * 100}%` }} />
          </div>
        </div>
        <span className="font-mono text-[13px] text-muted">2025 – 2028</span>
      </div>

      <SectionLabel className="mt-12 mb-5">skills</SectionLabel>
      <ul className="flex flex-wrap gap-2">
        {SKILLS.map((s) => (
          <li key={s} className="rounded-full bg-chip px-3 py-1 text-[15px] text-ink">{s}</li>
        ))}
      </ul>
    </main>
  )
}
