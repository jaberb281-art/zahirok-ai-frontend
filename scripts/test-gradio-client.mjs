import fs from "node:fs"
import path from "node:path"
import { Client } from "@gradio/client"

const envPath = path.join(process.cwd(), ".env.local")
let token = process.env.HF_TOKEN ?? ""

if (!token && fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^HF_TOKEN=(.*)$/)
    if (match) {
      token = match[1].trim().replace(/^["']|["']$/g, "")
    }
  }
}

console.log("token_present:", Boolean(token))

const client = await Client.connect("facebook/MusicGen", {
  token,
})

console.log("Connected. Calling predict_batched...")
try {
  const result = await client.predict("/predict_batched", {
    texts: ["classical orchestration with elegant melody"],
    melodies: [null],
  })
  console.log("RESULT:", JSON.stringify(result, null, 2).slice(0, 1500))
} catch (error) {
  console.log("FAILED:", error instanceof Error ? error.message : String(error))
  if (error && typeof error === "object" && "detail" in error) {
    console.log("DETAIL:", error.detail)
  }
}
