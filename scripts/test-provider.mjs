import fs from "node:fs"

process.env.HF_TOKEN = process.env.HF_TOKEN ?? ""
if (!process.env.HF_TOKEN && fs.existsSync(".env.local")) {
  for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const match = line.match(/^HF_TOKEN=(.*)$/)
    if (match) {
      process.env.HF_TOKEN = match[1].trim().replace(/^["']|["']$/g, "")
    }
  }
}

const { createHuggingFaceMusicProvider } = await import("../src/lib/music/providers/huggingface.ts")

try {
  const provider = createHuggingFaceMusicProvider()
  const result = await provider.generateMusic({
    prompt: "classical orchestration with elegant melody",
    duration: 10,
  })
  console.log("SUCCESS bytes:", result.audio.byteLength, "mime:", result.mimeType)
} catch (error) {
  console.log("ERROR code:", error?.code)
  console.log("ERROR message:", error instanceof Error ? error.message : String(error))
}
