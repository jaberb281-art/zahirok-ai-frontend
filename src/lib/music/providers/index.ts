import type { MusicProvider } from "@/lib/music/types"
import { createAIMusicAPIProvider } from "@/lib/music/providers/aimusicapi"

export function createMusicProvider(): MusicProvider {
  return createAIMusicAPIProvider()
}

export { createAIMusicAPIProvider } from "@/lib/music/providers/aimusicapi"
export { mapUnknownProviderError } from "@/lib/music/providers/aimusicapi"
