import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { createPirarucuScene, type PirarucuOptions } from "@/lib/pirarucu-scene"

/*
 * Pirarucu nadando visto de cima (WebGL). Ocupa o tamanho do pai.
 * Detalhes da animação em src/lib/pirarucu-scene.ts.
 * Sem WebGL, fica só o fundo escuro do painel.
 */
export function PirarucuPond({ className, ...opts }: PirarucuOptions & { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const scene = createPirarucuScene(ref.current!, { texture: `${import.meta.env.BASE_URL}assets/pirarucu.webp`, ...opts })
    return () => scene?.destroy()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <canvas
      ref={ref}
      aria-label="Pirarucu nadando num rio visto de cima"
      className={cn("block size-full touch-none bg-[#141710]", className)}
    />
  )
}
