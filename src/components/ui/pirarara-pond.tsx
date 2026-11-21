import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { createPirararaScene, type PirararaOptions } from "@/lib/pirarara-scene"

/*
 * Pirarara nadando visto de cima (WebGL). Ocupa o tamanho do pai.
 * Detalhes da animação em src/lib/pirarara-scene.ts.
 * Sem WebGL, fica só o fundo escuro do painel.
 */
export function PirararaPond({ className, ...opts }: PirararaOptions & { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const scene = createPirararaScene(ref.current!, { texture: `${import.meta.env.BASE_URL}assets/pirarara.webp`, ...opts })
    return () => scene?.destroy()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <canvas
      ref={ref}
      aria-label="Pirarara nadando num rio visto de cima"
      className={cn("block size-full touch-none bg-[#141710]", className)}
    />
  )
}
