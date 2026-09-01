"use client"

import { useMemo, useState, type FormEvent, type Ref } from "react"
import { MessageCircle, Send } from "lucide-react"

import { getMockComments } from "@/lib/api-client"
import type { SongComment } from "@/lib/api-contracts"
import { useCommentsHydrated, useCommentsStore } from "@/stores/comments-store"

// Relative timestamp. Only rendered after hydration (see `hydrated` gating) so
// this "now"-dependent label never mismatches the server-rendered HTML.
function formatRelativeTime(iso: string): string {
    const elapsedSeconds = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000))
    if (elapsedSeconds < 60) return "just now"
    const minutes = Math.floor(elapsedSeconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d ago`
    const weeks = Math.floor(days / 7)
    if (weeks < 5) return `${weeks}w ago`
    const months = Math.floor(days / 30)
    if (months < 12) return `${months}mo ago`
    return `${Math.floor(days / 365)}y ago`
}

// Base mock comments + persisted user comments (only when hydrated), newest first.
function mergeComments(
    songId: string,
    stored: SongComment[] | undefined,
    includeStored: boolean,
): SongComment[] {
    const base = getMockComments(songId)
    const merged = includeStored && stored ? [...base, ...stored] : base
    return [...merged].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
}

/** Total comment count for a song (base mock + persisted), client-gated. */
export function useCommentCount(songId: string): number {
    const hydrated = useCommentsHydrated()
    const stored = useCommentsStore((state) => state.commentsBySong[songId])
    return getMockComments(songId).length + (hydrated ? stored?.length ?? 0 : 0)
}

export function CommentsThread({
    songId,
    className = "",
    inputRef,
}: {
    songId: string
    className?: string
    inputRef?: Ref<HTMLInputElement>
}) {
    const hydrated = useCommentsHydrated()
    const stored = useCommentsStore((state) => state.commentsBySong[songId])
    const addComment = useCommentsStore((state) => state.addComment)
    const [draft, setDraft] = useState("")

    const comments = useMemo(
        () => mergeComments(songId, stored, hydrated),
        [songId, stored, hydrated],
    )

    function handleSubmit(event: FormEvent) {
        event.preventDefault()
        const body = draft.trim()
        if (!body) return
        addComment(songId, body)
        setDraft("")
    }

    return (
        <section className={`flex min-h-0 flex-col ${className}`}>
            <div className="flex shrink-0 items-center gap-2">
                <MessageCircle className="size-4 text-saffron" aria-hidden="true" />
                <h2 className="text-lg font-black text-sand">Comments</h2>
                <span className="text-sm font-bold text-sand/45">{comments.length}</span>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 flex shrink-0 items-center gap-2">
                <label className="min-w-0 flex-1">
                    <span className="sr-only">Write a comment</span>
                    <input
                        ref={inputRef}
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        placeholder="Write a comment"
                        className="h-12 w-full rounded-full border border-sand/12 bg-sand/[0.07] px-4 text-sm font-bold text-sand outline-none transition placeholder:text-sand/42 focus:border-saffron/45 focus:bg-sand/10"
                    />
                </label>
                <button
                    type="submit"
                    aria-label="Post comment"
                    disabled={!draft.trim()}
                    className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-saffron text-charcoal transition hover:bg-terracotta disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <Send className="size-4" aria-hidden="true" />
                </button>
            </form>

            <div className="mt-4 min-h-0 flex-1 overflow-y-auto">
                {comments.length === 0 ? (
                    <div className="rounded-2xl border border-sand/10 bg-[#08080a]/42 px-4 py-8 text-center">
                        <p className="text-xl font-black text-sand">No comments yet</p>
                        <p className="mt-2 text-sm font-semibold leading-6 text-sand/48">
                            Be the first to show your love for this song
                        </p>
                    </div>
                ) : (
                    <ul className="grid gap-3">
                        {comments.map((comment) => (
                            <li
                                key={comment.id}
                                className="rounded-2xl border border-sand/10 bg-sand/[0.05] p-3"
                            >
                                <div className="flex items-center gap-2">
                                    <span
                                        className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_30%,#f2d1aa_0%,#e37a2c_40%,#2f8f9a_100%)] text-[11px] font-black text-charcoal"
                                        aria-hidden="true"
                                    >
                                        {comment.authorName.charAt(0).toUpperCase()}
                                    </span>
                                    <span className="truncate text-sm font-black text-sand">
                                        {comment.authorName}
                                    </span>
                                    <time
                                        dateTime={comment.createdAt}
                                        className="ml-auto shrink-0 text-xs font-semibold text-sand/40"
                                    >
                                        {hydrated ? formatRelativeTime(comment.createdAt) : ""}
                                    </time>
                                </div>
                                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-sand/80">
                                    {comment.body}
                                </p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    )
}
