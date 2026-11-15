/* Conteúdo do site num lugar só: é aqui que o Victor edita textos e links. */
import { GraduationCapIcon, FlagBannerIcon } from "@phosphor-icons/react"
import type { CareerItem } from "@/components/ui/career-timeline"
import type { GalleryPhoto } from "@/components/ui/interactive-folder-gallery"

export const asset = (name: string) => `${import.meta.env.BASE_URL}assets/${name}`

// TODO(Victor): e-mail completo e link do LinkedIn
export const EMAIL = "vhbrilhante@"
export const LINKEDIN = "#"
export const GITHUB = "https://github.com/vhbrilhante"

export const CLOCK = { timeZone: "America/Porto_Velho", place: "Rondônia, BR" }

export const NAV = [
  { label: "skills", href: "#skills" },
  { label: "blog", href: "#blog" },
  { label: "github", href: GITHUB },
  { label: "arts", href: "#arts" },
  { label: "resume", href: "#/resume" },
]

// Projetos da pasta: imagens de exemplo até entrarem os projetos reais
export const PROJECTS: GalleryPhoto[] = [
  { id: 1, title: "Atlas", description: "Brand and marketing for a junior company", image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200&q=80" },
  { id: 2, title: "Foccodoggo", description: "Video studio identity", image: "https://images.unsplash.com/photo-1559028012-481c04fa702d?w=1200&q=80" },
  { id: 3, title: "Redes lab", description: "Networking study site", image: "https://images.unsplash.com/photo-1545235617-9465d2a55698?w=1200&q=80" },
  { id: 4, title: "UI study", description: "Flows and wireframes", image: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=1200&q=80" },
  { id: 5, title: "Arts", description: "Collages and experiments", image: "https://images.unsplash.com/photo-1541462608143-67571c6738dd?w=1200&q=80" },
]

/** Curso: 2025 a 2028. Atualize a fração a cada semestre. */
export const DEGREE_PROGRESS = 0.5

export const CAREER: CareerItem[] = [
  { title: "Computer Science", detail: "Started the degree", date: "2025", state: "past", icon: <FlagBannerIcon size={16} /> },
  { title: "Atlas", detail: "UI/UX and Marketing Lead", date: "now", state: "now", icon: <img src={asset("atlas.svg")} alt="" className="size-full" /> },
  { title: "SEDUC Rondônia", detail: "Network intern", date: "now", state: "now", icon: <img src={asset("seduc.png")} alt="" className="size-full" /> },
  { title: "Graduation", detail: "Computer Science degree", date: "2028", state: "future", icon: <GraduationCapIcon size={16} /> },
]
