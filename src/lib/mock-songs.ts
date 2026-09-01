/**
 * MOCK: Single source of truth for all mock song data across the Soroz AI frontend.
 *
 * Every page (Dashboard, Feed, Library, Song Detail) imports from here.
 * When the real backend ships, replace these with api-client calls.
 *
 * MVP: only Makkuran dialect is supported in first release.
 */

import type { Song } from "./types"

// ── Extended mock song type ─────────────────────────────────────────────────

export type MockSong = Song & {
    dialect: "Makkuran"
    creator: string
    comments: number
    /** CSS gradient for feed/library cover art */
    gradient: string
    /** CSS class for library cover art */
    coverClass: string
    /** Optional feed badge (e.g. "Staff Pick", "New") */
    badge?: string
    /** Optional cover art image path (relative to /public) */
    coverImage?: string
}

// ── All mock songs ──────────────────────────────────────────────────────────

const ALL_SONGS: MockSong[] = [
    {
        id: "song-makran-evening",
        title: "Makran Evening",
        prompt: "Create a warm Soroz song about evening memories along the Makran coast.",
        genrePreset: "Soroz",
        instruments: ["Suroz", "Damboora"],
        lyrics: "A traditional Balochi-inspired song about memory, land, and longing.",
        status: "completed",
        audioUrl: "/mock/audio-placeholder.mp3",
        mp3Url: "/mock/audio-placeholder.mp3",
        wavUrl: "/mock/audio-placeholder.wav",
        isPublic: true,
        createdAt: "2026-05-23T10:00:00Z",
        duration: "3:18",
        plays: 35000,
        likes: 606,
        remixes: 28,
        dialect: "Makkuran",
        creator: "Jalal Rakhshani",
        comments: 115,
        badge: "Staff Pick",
        gradient:
            "linear-gradient(135deg,rgba(227,122,44,0.6) 0%,rgba(183,62,31,0.35) 60%,rgba(26,22,18,0.95) 100%)",
        coverClass:
            "bg-[linear-gradient(135deg,rgba(18,80,86,0.92),rgba(18,18,22,0.98)),radial-gradient(circle_at_36%_30%,rgba(237,227,211,0.62),transparent_22%)]",
        coverImage: "/covers/makran-evening.png",
    },
    {
        id: "song-sufi-breath",
        title: "Sufi Breath",
        prompt: "A spiritual Sufi song with Damboora and Suroz in the Makkuran style.",
        genrePreset: "Sufi",
        instruments: ["Damboora", "Suroz"],
        lyrics: "A journey inward through sound and silence.",
        status: "completed",
        audioUrl: "/mock/audio-placeholder.mp3",
        mp3Url: "/mock/audio-placeholder.mp3",
        wavUrl: "/mock/audio-placeholder.wav",
        isPublic: true,
        createdAt: "2026-05-22T09:00:00Z",
        duration: "4:01",
        plays: 27000,
        likes: 642,
        remixes: 18,
        dialect: "Makkuran",
        creator: "Noor Dehwar",
        comments: 66,
        gradient:
            "linear-gradient(135deg,rgba(91,49,155,0.55) 0%,rgba(57,30,100,0.4) 60%,rgba(26,22,18,0.95) 100%)",
        coverClass:
            "bg-[linear-gradient(135deg,rgba(57,30,100,0.78),rgba(12,12,15,0.96)),radial-gradient(circle_at_45%_42%,rgba(227,122,44,0.65),transparent_22%)]",
        coverImage: "/covers/sufi-dambora.png",
    },
    {
        id: "song-wedding-doholl",
        title: "Wedding Doholl Nights",
        prompt: "A celebratory wedding song with Doholl drums and Rubab melody.",
        genrePreset: "Wedding",
        instruments: ["Doholl", "Rubab"],
        lyrics: "A celebration of love and tradition in Balochi culture.",
        status: "completed",
        audioUrl: "/mock/audio-placeholder.mp3",
        mp3Url: "/mock/audio-placeholder.mp3",
        wavUrl: "/mock/audio-placeholder.wav",
        isPublic: true,
        createdAt: "2026-05-21T15:00:00Z",
        duration: "3:05",
        plays: 22000,
        likes: 549,
        remixes: 14,
        dialect: "Makkuran",
        creator: "Mahzad Baloch",
        comments: 56,
        gradient:
            "linear-gradient(135deg,rgba(183,62,31,0.6) 0%,rgba(227,122,44,0.25) 60%,rgba(26,22,18,0.95) 100%)",
        coverClass:
            "bg-[linear-gradient(135deg,rgba(183,62,31,0.64),rgba(22,18,28,0.95)),radial-gradient(circle_at_42%_35%,rgba(237,227,211,0.5),transparent_20%)]",
        coverImage: "/covers/wedding-doholl.png",
    },
    {
        id: "song-desert-pulse",
        title: "Desert Pulse",
        prompt: "Make a modern Balochi hip-hop fusion track with desert rhythm and deep bass.",
        genrePreset: "Hip-Hop Fusion",
        instruments: ["Modern Drums", "Bass", "Synth"],
        lyrics: "A modern Balochi fusion track with energetic drums and cultural rhythm.",
        status: "completed",
        audioUrl: "/mock/audio-placeholder.mp3",
        mp3Url: "/mock/audio-placeholder.mp3",
        wavUrl: "/mock/audio-placeholder.wav",
        isPublic: false,
        createdAt: "2026-05-22T15:30:00Z",
        duration: "2:58",
        plays: 16000,
        likes: 461,
        remixes: 9,
        dialect: "Makkuran",
        creator: "Karzan Beat",
        comments: 50,
        gradient:
            "linear-gradient(135deg,rgba(50,50,70,0.7) 0%,rgba(35,35,55,0.45) 60%,rgba(26,22,18,0.95) 100%)",
        coverClass:
            "bg-[linear-gradient(135deg,rgba(26,58,92,0.86),rgba(12,12,15,0.98)),radial-gradient(circle_at_60%_30%,rgba(227,122,44,0.55),transparent_20%)]",
        coverImage: "/covers/desert-pulse.png",
    },
    {
        id: "song-coastal-drift",
        title: "Coastal Drift",
        prompt: "A coastal Liko melody with soft Damboora and sea breeze ambience.",
        genrePreset: "Liko",
        instruments: ["Damboora", "Bass", "Synth"],
        lyrics: "The sea and the string — a Balochi union.",
        status: "completed",
        audioUrl: "/mock/audio-placeholder.mp3",
        mp3Url: "/mock/audio-placeholder.mp3",
        wavUrl: "/mock/audio-placeholder.wav",
        isPublic: true,
        createdAt: "2026-05-20T17:00:00Z",
        duration: "3:44",
        plays: 10000,
        likes: 310,
        remixes: 4,
        dialect: "Makkuran",
        creator: "Azim Dashti",
        comments: 33,
        gradient:
            "linear-gradient(135deg,rgba(30,70,140,0.55) 0%,rgba(20,50,110,0.4) 60%,rgba(26,22,18,0.95) 100%)",
        coverClass:
            "bg-[linear-gradient(135deg,rgba(19,76,90,0.9),rgba(13,13,18,0.98)),radial-gradient(circle_at_60%_28%,rgba(227,122,44,0.62),transparent_20%)]",
        coverImage: "/covers/coastal-lullaby.png",
    },
    {
        id: "song-ya-nabi-salawat",
        title: "Ya Nabi Salawat",
        prompt: "A devotional Naat with Suroz and Tamburag in the Makkuran style.",
        genrePreset: "Naat",
        instruments: ["Suroz", "Tamburag"],
        lyrics: "Praise and devotion carried on strings and voice.",
        status: "completed",
        audioUrl: "/mock/audio-placeholder.mp3",
        mp3Url: "/mock/audio-placeholder.mp3",
        wavUrl: "/mock/audio-placeholder.wav",
        isPublic: true,
        createdAt: "2026-05-19T08:00:00Z",
        duration: "5:12",
        plays: 8900,
        likes: 212,
        remixes: 7,
        dialect: "Makkuran",
        creator: "Zareena Sajid",
        comments: 16,
        gradient:
            "linear-gradient(135deg,rgba(30,90,70,0.55) 0%,rgba(20,60,50,0.4) 60%,rgba(26,22,18,0.95) 100%)",
        coverClass:
            "bg-[linear-gradient(145deg,rgba(67,45,100,0.86),rgba(12,12,15,0.98)),radial-gradient(circle_at_52%_34%,rgba(237,227,211,0.68),transparent_20%)]",
    },
    {
        id: "song-makran-nightfall",
        title: "Makran Nightfall",
        prompt: "A deep Soroz melody about the last light over the Makran hills.",
        genrePreset: "Soroz",
        instruments: ["Suroz", "Damboora"],
        lyrics: "When the sun folds behind the hills, the Damboora answers.",
        status: "completed",
        audioUrl: "/mock/audio-placeholder.mp3",
        mp3Url: "/mock/audio-placeholder.mp3",
        wavUrl: "/mock/audio-placeholder.wav",
        isPublic: true,
        createdAt: "2026-05-18T20:00:00Z",
        duration: "3:52",
        plays: 29000,
        likes: 541,
        remixes: 12,
        dialect: "Makkuran",
        creator: "Jalal Rakhshani",
        comments: 49,
        badge: "Soroz",
        gradient:
            "linear-gradient(135deg,rgba(227,122,44,0.55) 0%,rgba(183,62,31,0.3) 60%,rgba(26,22,18,0.95) 100%)",
        coverClass:
            "bg-[radial-gradient(circle_at_50%_48%,rgba(227,122,44,0.95)_0%,rgba(20,190,185,0.65)_12%,rgba(33,20,36,0.94)_36%,rgba(10,16,18,1)_100%)]",
    },
    {
        id: "song-dusk-on-coast",
        title: "Dusk on the Coast",
        prompt: "A mellow Soroz tune inspired by dusk over the Gwadar coast.",
        genrePreset: "Soroz",
        instruments: ["Damboora", "Suroz"],
        lyrics: "The coast remembers every footprint in the sand.",
        status: "completed",
        audioUrl: "/mock/audio-placeholder.mp3",
        mp3Url: "/mock/audio-placeholder.mp3",
        wavUrl: "/mock/audio-placeholder.wav",
        isPublic: true,
        createdAt: "2026-05-17T18:00:00Z",
        duration: "4:15",
        plays: 16000,
        likes: 390,
        remixes: 6,
        dialect: "Makkuran",
        creator: "Noor Dehwar",
        comments: 27,
        gradient:
            "linear-gradient(160deg,rgba(183,62,31,0.5) 0%,rgba(26,58,92,0.4) 60%,rgba(26,22,18,0.95) 100%)",
        coverClass:
            "bg-[linear-gradient(160deg,rgba(183,62,31,0.64),rgba(22,18,28,0.95)),radial-gradient(circle_at_42%_35%,rgba(237,227,211,0.5),transparent_20%)]",
    },
    {
        id: "song-coastal-soroz",
        title: "Coastal Soroz",
        prompt: "A coastal Soroz melody with Rubab and Doholl.",
        genrePreset: "Soroz",
        instruments: ["Rubab", "Doholl"],
        lyrics: "The sea and the string — a Balochi union.",
        status: "completed",
        audioUrl: "/mock/audio-placeholder.mp3",
        mp3Url: "/mock/audio-placeholder.mp3",
        wavUrl: "/mock/audio-placeholder.wav",
        isPublic: true,
        createdAt: "2026-05-16T14:00:00Z",
        duration: "3:44",
        plays: 14000,
        likes: 391,
        remixes: 5,
        dialect: "Makkuran",
        creator: "Mahzad Baloch",
        comments: 33,
        gradient:
            "linear-gradient(135deg,rgba(227,122,44,0.45) 0%,rgba(91,49,155,0.25) 60%,rgba(26,22,18,0.95) 100%)",
        coverClass:
            "bg-[linear-gradient(135deg,rgba(227,122,44,0.45),rgba(91,49,155,0.25),rgba(26,22,18,0.95))]",
    },
    {
        id: "song-suroz-at-dawn",
        title: "Suroz at Dawn",
        prompt: "A quiet Soroz piece with solo Suroz as morning breaks over Kech.",
        genrePreset: "Soroz",
        instruments: ["Suroz"],
        lyrics: "Before the world wakes, the Suroz speaks.",
        status: "completed",
        audioUrl: "/mock/audio-placeholder.mp3",
        mp3Url: "/mock/audio-placeholder.mp3",
        wavUrl: "/mock/audio-placeholder.wav",
        isPublic: true,
        createdAt: "2026-05-15T06:00:00Z",
        duration: "3:08",
        plays: 8900,
        likes: 234,
        remixes: 3,
        dialect: "Makkuran",
        creator: "Karimi Band",
        comments: 18,
        gradient:
            "linear-gradient(135deg,rgba(227,122,44,0.5) 0%,rgba(30,70,140,0.3) 60%,rgba(26,22,18,0.95) 100%)",
        coverClass:
            "bg-[linear-gradient(135deg,rgba(227,122,44,0.5),rgba(30,70,140,0.3),rgba(26,22,18,0.95))]",
    },
    {
        id: "song-memory-of-gwadar",
        title: "Memory of Gwadar",
        prompt: "A nostalgic Soroz ballad about childhood in Gwadar.",
        genrePreset: "Soroz",
        instruments: ["Damboora", "Suroz"],
        lyrics: "Every street in Gwadar holds a song we forgot.",
        status: "completed",
        audioUrl: "/mock/audio-placeholder.mp3",
        mp3Url: "/mock/audio-placeholder.mp3",
        wavUrl: "/mock/audio-placeholder.wav",
        isPublic: true,
        createdAt: "2026-05-14T10:00:00Z",
        duration: "4:32",
        plays: 21700,
        likes: 3500,
        remixes: 22,
        dialect: "Makkuran",
        creator: "Dil Nawaz",
        comments: 338,
        badge: "New",
        gradient:
            "linear-gradient(135deg,rgba(183,62,31,0.55) 0%,rgba(227,122,44,0.35) 60%,rgba(26,22,18,0.95) 100%)",
        coverClass:
            "bg-[linear-gradient(135deg,rgba(183,62,31,0.55),rgba(227,122,44,0.35),rgba(26,22,18,0.95))]",
    },
    {
        id: "song-shepherds-melody",
        title: "Shepherd's Melody",
        prompt: "A pastoral Soroz folk tune from the highlands.",
        genrePreset: "Soroz",
        instruments: ["Damboora"],
        lyrics: "The shepherd's song carries over the valley at dusk.",
        status: "completed",
        audioUrl: "/mock/audio-placeholder.mp3",
        mp3Url: "/mock/audio-placeholder.mp3",
        wavUrl: "/mock/audio-placeholder.wav",
        isPublic: true,
        createdAt: "2026-05-13T08:00:00Z",
        duration: "3:30",
        plays: 7200,
        likes: 198,
        remixes: 4,
        dialect: "Makkuran",
        creator: "Azim Dashti",
        comments: 22,
        badge: "Makkuran",
        gradient:
            "linear-gradient(135deg,rgba(227,122,44,0.4) 0%,rgba(26,22,18,0.9) 100%)",
        coverClass:
            "bg-[linear-gradient(135deg,rgba(227,122,44,0.4),rgba(26,22,18,0.9))]",
    },
    {
        id: "song-fishermans-return",
        title: "Fisherman's Return",
        prompt: "A Liko song about a fisherman returning to the Makran shore.",
        genrePreset: "Liko",
        instruments: ["Suroz", "Damboora"],
        lyrics: "The boat returns, the net is heavy, the family waits.",
        status: "completed",
        audioUrl: "/mock/audio-placeholder.mp3",
        mp3Url: "/mock/audio-placeholder.mp3",
        wavUrl: "/mock/audio-placeholder.wav",
        isPublic: true,
        createdAt: "2026-05-12T17:00:00Z",
        duration: "4:10",
        plays: 5400,
        likes: 145,
        remixes: 2,
        dialect: "Makkuran",
        creator: "Noor Dehwar",
        comments: 14,
        gradient:
            "linear-gradient(135deg,rgba(30,70,140,0.45) 0%,rgba(26,22,18,0.9) 100%)",
        coverClass:
            "bg-[linear-gradient(135deg,rgba(30,70,140,0.45),rgba(26,22,18,0.9))]",
    },
    {
        id: "song-kech-valley",
        title: "Kech Valley Song",
        prompt: "A Sout song from the heart of the Kech Valley.",
        genrePreset: "Sout",
        instruments: ["Tamburag", "Doholl"],
        lyrics: "The valley hums in a language only the wind understands.",
        status: "completed",
        audioUrl: "/mock/audio-placeholder.mp3",
        mp3Url: "/mock/audio-placeholder.mp3",
        wavUrl: "/mock/audio-placeholder.wav",
        isPublic: true,
        createdAt: "2026-05-11T09:00:00Z",
        duration: "3:55",
        plays: 4100,
        likes: 112,
        remixes: 1,
        dialect: "Makkuran",
        creator: "Karimi Band",
        comments: 9,
        gradient:
            "linear-gradient(135deg,rgba(30,90,70,0.45) 0%,rgba(26,22,18,0.9) 100%)",
        coverClass:
            "bg-[linear-gradient(135deg,rgba(30,90,70,0.45),rgba(26,22,18,0.9))]",
    },
    {
        id: "song-damboora-night",
        title: "Damboora Night",
        prompt: "Sparse percussion, Damboora ostinato, and intimate Makkuran vocal harmonies over a Gwadar night-drive mood.",
        genrePreset: "Soroz",
        instruments: ["Damboora", "Suroz"],
        lyrics: "The Damboora plays through the night, answering the stars.",
        status: "completed",
        audioUrl: "/mock/audio-placeholder.mp3",
        mp3Url: "/mock/audio-placeholder.mp3",
        wavUrl: "/mock/audio-placeholder.wav",
        isPublic: true,
        createdAt: "2026-05-10T20:00:00Z",
        duration: "5:01",
        plays: 6800,
        likes: 178,
        remixes: 3,
        dialect: "Makkuran",
        creator: "Jalal Rakhshani",
        comments: 19,
        gradient:
            "linear-gradient(135deg,rgba(183,62,31,0.4) 0%,rgba(26,22,18,0.9) 100%)",
        coverClass:
            "bg-[linear-gradient(135deg,rgba(183,62,31,0.4),rgba(26,22,18,0.9))]",
    },
    {
        id: "song-rubab-tales",
        title: "Rubab Tales",
        prompt: "A Soroz folk medley with Rubab as the lead voice.",
        genrePreset: "Soroz",
        instruments: ["Rubab", "Damboora"],
        lyrics: "Each string of the Rubab tells a different story.",
        status: "completed",
        audioUrl: "/mock/audio-placeholder.mp3",
        mp3Url: "/mock/audio-placeholder.mp3",
        wavUrl: "/mock/audio-placeholder.wav",
        isPublic: true,
        createdAt: "2026-05-09T14:00:00Z",
        duration: "3:22",
        plays: 3900,
        likes: 97,
        remixes: 1,
        dialect: "Makkuran",
        creator: "Mahzad Baloch",
        comments: 7,
        gradient:
            "linear-gradient(135deg,rgba(227,122,44,0.35) 0%,rgba(91,49,155,0.2) 60%,rgba(26,22,18,0.9) 100%)",
        coverClass:
            "bg-[linear-gradient(135deg,rgba(227,122,44,0.35),rgba(91,49,155,0.2),rgba(26,22,18,0.9))]",
    },
    {
        id: "song-doholl-dance",
        title: "Doholl Dance",
        prompt: "A high-energy wedding dance with fast Doholl patterns.",
        genrePreset: "Wedding",
        instruments: ["Doholl", "Rubab"],
        lyrics: "The floor shakes with the rhythm of celebration.",
        status: "completed",
        audioUrl: "/mock/audio-placeholder.mp3",
        mp3Url: "/mock/audio-placeholder.mp3",
        wavUrl: "/mock/audio-placeholder.wav",
        isPublic: true,
        createdAt: "2026-05-08T18:00:00Z",
        duration: "3:45",
        plays: 12000,
        likes: 320,
        remixes: 8,
        dialect: "Makkuran",
        creator: "Mahzad Baloch",
        comments: 41,
        badge: "Studio",
        gradient:
            "linear-gradient(135deg,rgba(183,62,31,0.6) 0%,rgba(227,122,44,0.3) 60%,rgba(26,22,18,0.95) 100%)",
        coverClass:
            "bg-[linear-gradient(135deg,rgba(183,62,31,0.6),rgba(227,122,44,0.3),rgba(26,22,18,0.95))]",
    },
    {
        id: "song-brides-march",
        title: "Bride's March",
        prompt: "A gentle wedding processional with Suroz and soft percussion.",
        genrePreset: "Wedding",
        instruments: ["Suroz", "Doholl"],
        lyrics: "She walks with grace as the Suroz sings her name.",
        status: "completed",
        audioUrl: "/mock/audio-placeholder.mp3",
        mp3Url: "/mock/audio-placeholder.mp3",
        wavUrl: "/mock/audio-placeholder.wav",
        isPublic: true,
        createdAt: "2026-05-07T15:00:00Z",
        duration: "4:20",
        plays: 9500,
        likes: 267,
        remixes: 5,
        dialect: "Makkuran",
        creator: "Zareena Sajid",
        comments: 28,
        gradient:
            "linear-gradient(135deg,rgba(227,122,44,0.5) 0%,rgba(183,62,31,0.4) 60%,rgba(26,22,18,0.95) 100%)",
        coverClass:
            "bg-[linear-gradient(135deg,rgba(227,122,44,0.5),rgba(183,62,31,0.4),rgba(26,22,18,0.95))]",
    },
    {
        id: "song-celebration-night",
        title: "Celebration Night",
        prompt: "A lively wedding celebration with modern drums and traditional melody.",
        genrePreset: "Wedding",
        instruments: ["Doholl", "Modern Drums"],
        lyrics: "Tonight we dance until the stars fade.",
        status: "completed",
        audioUrl: "/mock/audio-placeholder.mp3",
        mp3Url: "/mock/audio-placeholder.mp3",
        wavUrl: "/mock/audio-placeholder.wav",
        isPublic: true,
        createdAt: "2026-05-06T21:00:00Z",
        duration: "3:15",
        plays: 7800,
        likes: 189,
        remixes: 3,
        dialect: "Makkuran",
        creator: "Karzan Beat",
        comments: 15,
        gradient:
            "linear-gradient(135deg,rgba(227,122,44,0.6) 0%,rgba(26,58,92,0.3) 60%,rgba(26,22,18,0.95) 100%)",
        coverClass:
            "bg-[linear-gradient(135deg,rgba(227,122,44,0.6),rgba(26,58,92,0.3),rgba(26,22,18,0.95))]",
    },
    {
        id: "song-joy-of-turbat",
        title: "Joy of Turbat",
        prompt: "A joyful wedding piece inspired by Turbat festivities.",
        genrePreset: "Wedding",
        instruments: ["Doholl", "Damboora"],
        lyrics: "Turbat rejoices — every hand claps, every heart sings.",
        status: "completed",
        audioUrl: "/mock/audio-placeholder.mp3",
        mp3Url: "/mock/audio-placeholder.mp3",
        wavUrl: "/mock/audio-placeholder.wav",
        isPublic: true,
        createdAt: "2026-05-05T19:00:00Z",
        duration: "2:55",
        plays: 5600,
        likes: 134,
        remixes: 2,
        dialect: "Makkuran",
        creator: "Dil Nawaz",
        comments: 11,
        gradient:
            "linear-gradient(135deg,rgba(183,62,31,0.5) 0%,rgba(91,49,155,0.2) 60%,rgba(26,22,18,0.95) 100%)",
        coverClass:
            "bg-[linear-gradient(135deg,rgba(183,62,31,0.5),rgba(91,49,155,0.2),rgba(26,22,18,0.95))]",
        coverImage: "/covers/turbat-night.png",
    },
    {
        id: "song-sacred-ground",
        title: "Sacred Ground",
        prompt: "A meditative Sufi piece with solo Damboora.",
        genrePreset: "Sufi",
        instruments: ["Damboora"],
        lyrics: "Stillness between the notes. The ground beneath speaks.",
        status: "completed",
        audioUrl: "/mock/audio-placeholder.mp3",
        mp3Url: "/mock/audio-placeholder.mp3",
        wavUrl: "/mock/audio-placeholder.wav",
        isPublic: true,
        createdAt: "2026-05-04T12:00:00Z",
        duration: "4:28",
        plays: 11000,
        likes: 298,
        remixes: 6,
        dialect: "Makkuran",
        creator: "Noor Dehwar",
        comments: 35,
        gradient:
            "linear-gradient(135deg,rgba(91,49,155,0.6) 0%,rgba(57,30,100,0.4) 60%,rgba(26,22,18,0.95) 100%)",
        coverClass:
            "bg-[linear-gradient(135deg,rgba(91,49,155,0.6),rgba(57,30,100,0.4),rgba(26,22,18,0.95))]",
    },
    {
        id: "song-inner-journey",
        title: "Inner Journey",
        prompt: "A Sufi exploration with layered Suroz and Damboora.",
        genrePreset: "Sufi",
        instruments: ["Damboora", "Suroz"],
        lyrics: "Close your eyes. The journey begins within.",
        status: "completed",
        audioUrl: "/mock/audio-placeholder.mp3",
        mp3Url: "/mock/audio-placeholder.mp3",
        wavUrl: "/mock/audio-placeholder.wav",
        isPublic: true,
        createdAt: "2026-05-03T10:00:00Z",
        duration: "5:30",
        plays: 8700,
        likes: 245,
        remixes: 4,
        dialect: "Makkuran",
        creator: "Azim Dashti",
        comments: 22,
        gradient:
            "linear-gradient(135deg,rgba(57,30,100,0.5) 0%,rgba(26,58,92,0.4) 60%,rgba(26,22,18,0.95) 100%)",
        coverClass:
            "bg-[linear-gradient(135deg,rgba(57,30,100,0.5),rgba(26,58,92,0.4),rgba(26,22,18,0.95))]",
    },
    {
        id: "song-devotion",
        title: "Devotion",
        prompt: "A devotional Naat with Suroz and soft Damboora.",
        genrePreset: "Naat",
        instruments: ["Suroz", "Damboora"],
        lyrics: "Devotion is the breath between prayers.",
        status: "completed",
        audioUrl: "/mock/audio-placeholder.mp3",
        mp3Url: "/mock/audio-placeholder.mp3",
        wavUrl: "/mock/audio-placeholder.wav",
        isPublic: true,
        createdAt: "2026-05-02T08:00:00Z",
        duration: "6:10",
        plays: 6400,
        likes: 187,
        remixes: 3,
        dialect: "Makkuran",
        creator: "Zareena Sajid",
        comments: 14,
        gradient:
            "linear-gradient(135deg,rgba(30,90,70,0.5) 0%,rgba(20,60,50,0.35) 60%,rgba(26,22,18,0.95) 100%)",
        coverClass:
            "bg-[linear-gradient(135deg,rgba(30,90,70,0.5),rgba(20,60,50,0.35),rgba(26,22,18,0.95))]",
    },
    {
        id: "song-wandering-soul",
        title: "Wandering Soul",
        prompt: "A wandering Sufi melody with reflective Damboora.",
        genrePreset: "Sufi",
        instruments: ["Damboora"],
        lyrics: "The soul wanders where the feet cannot follow.",
        status: "completed",
        audioUrl: "/mock/audio-placeholder.mp3",
        mp3Url: "/mock/audio-placeholder.mp3",
        wavUrl: "/mock/audio-placeholder.wav",
        isPublic: true,
        createdAt: "2026-05-01T16:00:00Z",
        duration: "4:45",
        plays: 5200,
        likes: 156,
        remixes: 2,
        dialect: "Makkuran",
        creator: "Jalal Rakhshani",
        comments: 9,
        gradient:
            "linear-gradient(135deg,rgba(91,49,155,0.45) 0%,rgba(183,62,31,0.2) 60%,rgba(26,22,18,0.95) 100%)",
        coverClass:
            "bg-[linear-gradient(135deg,rgba(91,49,155,0.45),rgba(183,62,31,0.2),rgba(26,22,18,0.95))]",
    },
    {
        id: "song-damboora-meditation",
        title: "Damboora Meditation",
        prompt: "A long-form Sufi meditation on solo Damboora.",
        genrePreset: "Sufi",
        instruments: ["Damboora"],
        lyrics: "Silence is the longest note.",
        status: "completed",
        audioUrl: "/mock/audio-placeholder.mp3",
        mp3Url: "/mock/audio-placeholder.mp3",
        wavUrl: "/mock/audio-placeholder.wav",
        isPublic: true,
        createdAt: "2026-04-30T12:00:00Z",
        duration: "7:02",
        plays: 4100,
        likes: 120,
        remixes: 1,
        dialect: "Makkuran",
        creator: "Noor Dehwar",
        comments: 8,
        gradient:
            "linear-gradient(135deg,rgba(57,30,100,0.55) 0%,rgba(91,49,155,0.3) 60%,rgba(26,22,18,0.95) 100%)",
        coverClass:
            "bg-[linear-gradient(135deg,rgba(57,30,100,0.55),rgba(91,49,155,0.3),rgba(26,22,18,0.95))]",
    },
    {
        id: "song-quiet-hours",
        title: "Quiet Hours",
        prompt: "Dark motivational trap with warm acoustic plucks, deep 808s, and cinematic ambience for a late-night Makkuran hook.",
        genrePreset: "Hip-Hop Fusion",
        instruments: ["Modern Drums", "Bass", "Synth"],
        lyrics: "Late nights, quiet hours, the bass speaks louder than words.",
        status: "completed",
        audioUrl: "/mock/audio-placeholder.mp3",
        mp3Url: "/mock/audio-placeholder.mp3",
        wavUrl: "/mock/audio-placeholder.wav",
        isPublic: false,
        createdAt: "2026-05-30T19:00:00Z",
        duration: "2:17",
        plays: 23,
        likes: 7,
        remixes: 0,
        dialect: "Makkuran",
        creator: "Karzan Beat",
        comments: 1,
        gradient:
            "linear-gradient(135deg,rgba(50,50,70,0.6) 0%,rgba(26,22,18,0.95) 100%)",
        coverClass:
            "bg-[linear-gradient(135deg,rgba(26,58,92,0.86),rgba(12,12,15,0.98)),radial-gradient(circle_at_60%_30%,rgba(227,122,44,0.55),transparent_20%)]",
    },
    {
        id: "song-vinyl-pulse",
        title: "Vinyl Pulse",
        prompt: "Warm Soroz loop with Suroz fragments, dusty vinyl texture, and Damboora accents for a short Makkuran preview.",
        genrePreset: "Soroz",
        instruments: ["Suroz", "Damboora"],
        lyrics: "",
        status: "completed",
        audioUrl: "/mock/audio-placeholder.mp3",
        mp3Url: "/mock/audio-placeholder.mp3",
        wavUrl: "/mock/audio-placeholder.wav",
        isPublic: false,
        createdAt: "2026-05-31T11:20:00Z",
        duration: "1:00",
        plays: 1,
        likes: 0,
        remixes: 0,
        dialect: "Makkuran",
        creator: "Jalal Rakhshani",
        comments: 0,
        gradient:
            "linear-gradient(135deg,rgba(227,122,44,0.5) 0%,rgba(26,22,18,0.9) 100%)",
        coverClass:
            "bg-[radial-gradient(circle_at_50%_48%,rgba(227,122,44,0.95)_0%,rgba(20,190,185,0.65)_12%,rgba(33,20,36,0.94)_36%,rgba(10,16,18,1)_100%)]",
    },
]

// ── Real sample audio ────────────────────────────────────────────────────────
// MOCK: real, CORS-enabled sample tracks (served from jsdelivr) so the
// Howler-backed player is testable end-to-end. CORS matters here so the
// WaveSurfer visualizer can also fetch peaks. Replace with real
// generated/stored audio when the backend ships.
const SAMPLE_AUDIO_URLS = [
    "https://cdn.jsdelivr.net/gh/mdn/webaudio-examples/audio-basics/outfoxing.mp3",
    "https://cdn.jsdelivr.net/gh/mdn/webaudio-examples/audio-analyser/viper.mp3",
    "https://cdn.jsdelivr.net/gh/katspaugh/wavesurfer.js@7/examples/audio/stereo.mp3",
] as const

/** Pick a sample audio URL by index, round-robin over the shared source. */
export function sampleAudioUrl(index: number): string {
    return SAMPLE_AUDIO_URLS[Math.abs(Math.trunc(index)) % SAMPLE_AUDIO_URLS.length]
}

// Assign sample audio round-robin so adjacent tracks differ (useful for testing
// next/prev). mp3Url drives playback; wavUrl mirrors it for the mock download UI.
ALL_SONGS.forEach((song, index) => {
    const url = SAMPLE_AUDIO_URLS[index % SAMPLE_AUDIO_URLS.length]
    song.audioUrl = url
    song.mp3Url = url
    song.wavUrl = url
})

// ── Index for O(1) lookup ───────────────────────────────────────────────────

const SONGS_BY_ID = new Map(ALL_SONGS.map((s) => [s.id, s]))

// ── Public API ──────────────────────────────────────────────────────────────

/** Get all mock songs */
export function getMockSongs(): MockSong[] {
    return ALL_SONGS
}

/** Get a single mock song by ID, or undefined */
export function getMockSongById(id: string): MockSong | undefined {
    return SONGS_BY_ID.get(id)
}

/** Get public songs for the Explore/Feed page */
export function getFeedSongs(): MockSong[] {
    return ALL_SONGS.filter((s) => s.isPublic)
}

/** Get songs for the Library page (all songs, including private) */
export function getLibrarySongs(): MockSong[] {
    return ALL_SONGS
}

/** Convert a MockSong to the base Song type for the player store */
export function toPlayerSong(song: MockSong): Song {
    return {
        id: song.id,
        title: song.title,
        prompt: song.prompt,
        genrePreset: song.genrePreset,
        instruments: song.instruments,
        lyrics: song.lyrics,
        status: song.status,
        audioUrl: song.audioUrl,
        mp3Url: song.mp3Url,
        wavUrl: song.wavUrl,
        isPublic: song.isPublic,
        createdAt: song.createdAt,
        duration: song.duration,
        plays: song.plays,
        likes: song.likes,
        remixes: song.remixes,
    }
}

/** Format a play/like/comment count for display */
export function formatCount(value: number): string {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}K`
    return value.toString()
}

// MOCK: keep MOCK_SONGS export for backward compat with api-client.ts
export const MOCK_SONGS: Song[] = ALL_SONGS.slice(0, 2).map(toPlayerSong)
