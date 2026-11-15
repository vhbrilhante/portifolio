import { useEffect, useState } from "react"
import { sfx } from "@/lib/sfx"

export function useSfxEnabled() {
  const [on, setOn] = useState(sfx.enabled)
  useEffect(() => sfx.subscribe(setOn), [])
  return [on, (v: boolean) => sfx.setEnabled(v)] as const
}
