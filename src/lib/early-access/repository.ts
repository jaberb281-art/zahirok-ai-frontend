import { promises as fs } from "fs"
import path from "path"

import { isDatabaseConfigured, prisma } from "@/lib/db/prisma"
import type { EarlyAccessSubmissionInput } from "@/lib/early-access/validation"

export interface EarlyAccessRecord extends EarlyAccessSubmissionInput {
  id: string
  createdAt: Date
}

export class EarlyAccessDuplicateError extends Error {
  constructor() {
    super("This email is already on the early access list.")
    this.name = "EarlyAccessDuplicateError"
  }
}

const memoryStore = new Map<string, EarlyAccessRecord>()
const FILE_STORE_PATH = path.join(process.cwd(), ".data", "early-access-submissions.json")

async function readFileStore(): Promise<EarlyAccessRecord[]> {
  try {
    const raw = await fs.readFile(FILE_STORE_PATH, "utf8")
    const parsed = JSON.parse(raw) as EarlyAccessRecord[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

async function writeFileStore(records: EarlyAccessRecord[]): Promise<void> {
  await fs.mkdir(path.dirname(FILE_STORE_PATH), { recursive: true })
  await fs.writeFile(FILE_STORE_PATH, JSON.stringify(records, null, 2), "utf8")
}

async function saveToFallbackStore(
  input: EarlyAccessSubmissionInput,
): Promise<EarlyAccessRecord> {
  const normalizedEmail = input.email.toLowerCase()
  const record: EarlyAccessRecord = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date(),
  }

  if (memoryStore.has(normalizedEmail)) {
    throw new EarlyAccessDuplicateError()
  }

  const fileRecords = await readFileStore()
  if (fileRecords.some((entry) => entry.email.toLowerCase() === normalizedEmail)) {
    throw new EarlyAccessDuplicateError()
  }

  memoryStore.set(normalizedEmail, record)
  await writeFileStore([record, ...fileRecords])
  return record
}

export async function saveEarlyAccessSubmission(
  input: EarlyAccessSubmissionInput,
): Promise<EarlyAccessRecord> {
  const normalizedEmail = input.email.trim().toLowerCase()

  if (isDatabaseConfigured()) {
    try {
      const created = await prisma.earlyAccessSubmission.create({
        data: {
          email: normalizedEmail,
          creatorTypes: [...input.creatorTypes],
          languages: [...input.languages],
          interests: [...input.interests],
          currentWorkflow: input.currentWorkflow,
          runsMusicChannel: input.runsMusicChannel,
          channelUrl: input.channelUrl?.trim() || null,
          socialUrl: input.socialUrl?.trim() || null,
        },
      })

      return {
        id: created.id,
        email: created.email,
        creatorTypes: created.creatorTypes as EarlyAccessSubmissionInput["creatorTypes"],
        languages: created.languages as EarlyAccessSubmissionInput["languages"],
        interests: created.interests as EarlyAccessSubmissionInput["interests"],
        currentWorkflow: created.currentWorkflow as EarlyAccessSubmissionInput["currentWorkflow"],
        runsMusicChannel: created.runsMusicChannel as "Yes" | "No",
        channelUrl: created.channelUrl ?? undefined,
        socialUrl: created.socialUrl ?? undefined,
        createdAt: created.createdAt,
      }
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "P2002"
      ) {
        throw new EarlyAccessDuplicateError()
      }
      throw error
    }
  }

  return saveToFallbackStore({ ...input, email: normalizedEmail })
}
