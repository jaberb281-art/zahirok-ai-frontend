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

console.log("Submitting with async iterator...")
const stream = client.submit("/predict_batched", {
  texts: "classical orchestration with elegant melody",
  melodies: null,
})

for await (const message of stream) {
  console.log("event:", JSON.stringify(message).slice(0, 1500))
}
