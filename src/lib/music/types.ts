export interface MusicGenerationInput {
  prompt: string
  duration?: number
  lyrics?: string
  title?: string
  tags?: string
  instrumental?: boolean
  /** When true, `lyrics` is treated as explicit lyric text for custom_mode. */
  useCustomLyrics?: boolean
  signal?: AbortSignal
}

export interface MusicGenerationResult {
  audio: ArrayBuffer
  mimeType: string
  duration?: number
  providerTaskId?: string
}

export interface MusicProvider {
  generateMusic(input: MusicGenerationInput): Promise<MusicGenerationResult>
}
