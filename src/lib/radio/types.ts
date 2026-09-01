export interface RadioStation {
  id: string
  name: string
  logo: string
  country: string
  language: string
  tags: string
  bitrate: number
  streamUrl: string
}

export interface RadioStationsResponse {
  stations: RadioStation[]
}

export interface RadioSearchParams {
  country?: string
  language?: string
  tag?: string
  q?: string
  limit?: number
}
