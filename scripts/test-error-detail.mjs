import fs from "node:fs"
import { Client } from "@gradio/client"

const SPACE = "facebook/MusicGen"

let token = process.env.HF_TOKEN ?? ""
if (!token && fs.existsSync(".env.local")) {
  for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const match = line.match(/^HF_TOKEN=(.*)$/)
    if (match) {
      token = match[1].trim().replace(/^["']|["']$/g, "")
    }
  }
}

const client = await Client.connect(SPACE, token ? { token } : {})

try {
  await client.predict("/predict_batched", {
    texts: "classical orchestration with elegant melody",
    melodies: null,
  })
} catch (error) {
  console.log("message:", error instanceof Error ? error.message : String(error))
  console.log("keys:", Object.keys(error ?? {}))
  console.log("detail:", JSON.stringify(error, null, 2))
}
