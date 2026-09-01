import type {
  AccountResponse,
  ExploreFeedResponse,
  GenerateSongRequest,
  GenerateSongResponse,
  GenerationStage,
  GenerationStatusResponse,
  LibraryResponse,
  SongComment,
  SongDetailResponse,
  VoiceDonationRequest,
  VoiceDonationResponse,
} from "./api-contracts"
import { MOCK_SONGS } from "./mock-songs"

type PaginationParams = {
  page?: number
  pageSize?: number
}

const MOCK_COMMENTS = [
  {
    id: "comment-1",
    songId: "song-1",
    authorName: "Soroz Creator",
    body: "This sounds like home.",
    createdAt: "2026-05-23T12:00:00Z",
  },
  {
    id: "comment-2",
    songId: "song-1",
    authorName: "Makran Listener",
    body: "The Suroz feeling is beautiful.",
    createdAt: "2026-05-23T12:15:00Z",
  },
]

/**
 * Mock comments for a song, rebased to the given id. Shared (sync) source for
 * the comments UI; the async getSongById above uses the same MOCK_COMMENTS.
 */
export function getMockComments(songId: string): SongComment[] {
  return MOCK_COMMENTS.map((comment) => ({ ...comment, songId }))
}

const wait = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms)
  })

export async function generateSong(
  request: GenerateSongRequest,
): Promise<GenerateSongResponse> {
  await wait(300)

  const timestamp = Date.now()
  const slug = request.genrePreset.toLowerCase().replace(/[^a-z0-9]+/g, "-")

  return {
    songId: `mock-${slug}-${timestamp}`,
    jobId: `job-${timestamp}`,
    status: "queued",
  }
}

export async function getGenerationStatus(
  songId: string,
): Promise<GenerationStatusResponse> {
  await wait(250)

  const stages: GenerationStage[] = [
    "queued",
    "preparing",
    "checking_style",
    "annotating_pronunciation",
    "generating_vocals",
    "composing_instruments",
    "mixing",
    "uploading",
    "completed",
  ]
  const stageIndex = Math.abs(songId.length) % stages.length
  const currentStage = stages[stageIndex]
  const isCompleted = currentStage === "completed"

  return {
    songId,
    jobId: `job-${songId}`,
    status: isCompleted ? "completed" : "generating",
    currentStage,
    progress: isCompleted ? 100 : Math.min(95, stageIndex * 12),
    message: isCompleted
      ? "Mock generation completed."
      : "Mock generation is progressing.",
  }
}

export async function getLibrary(
  params: PaginationParams = {},
): Promise<LibraryResponse> {
  await wait(220)

  const page = params.page ?? 1
  const pageSize = params.pageSize ?? MOCK_SONGS.length
  const start = (page - 1) * pageSize
  const songs = MOCK_SONGS.slice(start, start + pageSize)

  return {
    songs,
    total: MOCK_SONGS.length,
    page,
    pageSize,
  }
}

export async function getExploreFeed(
  params: PaginationParams = {},
): Promise<ExploreFeedResponse> {
  await wait(220)

  const publicSongs = MOCK_SONGS.filter((song) => song.isPublic)
  const page = params.page ?? 1
  const pageSize = params.pageSize ?? publicSongs.length
  const start = (page - 1) * pageSize
  const songs = publicSongs.slice(start, start + pageSize)

  return {
    songs,
    total: publicSongs.length,
    page,
    pageSize,
  }
}

export async function getSongById(
  id: string,
): Promise<SongDetailResponse | null> {
  await wait(200)

  const song = MOCK_SONGS.find((item) => item.id === id)

  if (!song) {
    return null
  }

  return {
    song,
    comments: MOCK_COMMENTS.map((comment) => ({
      ...comment,
      songId: song.id,
    })),
    socialStats: {
      plays: song.plays,
      likes: song.likes,
      remixes: song.remixes,
    },
  }
}

export async function getAccount(): Promise<AccountResponse> {
  await wait(240)

  return {
    id: "user-1",
    name: "Soroz Creator",
    email: "creator@example.com",
    country: "Pakistan",
    tier: "free",
    creditsRemaining: 3,
    creditsLimit: 5,
    createdAt: "2026-05-01T00:00:00Z",
  }
}

export async function submitVoiceDonation(
  request: VoiceDonationRequest,
): Promise<VoiceDonationResponse> {
  await wait(350)

  return {
    donationId: `voice-donation-${Date.now()}`,
    status: request.consentAccepted ? "received" : "pending_review",
    message: "Voice submission backend will be connected later.",
  }
}
