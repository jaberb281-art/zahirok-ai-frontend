import fs from "node:fs"
import path from "node:path"
import { InferenceClient } from "@huggingface/inference"

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

const client = new InferenceClient(token)

async function tryProvider(provider) {
  try {
    console.log(`\nTrying provider=${provider} ...`)
    const blob = await client.textToAudio({
      provider,
      model: "facebook/musicgen-small",
      inputs: "classical orchestration with elegant melody",
      parameters: { duration: 10 },
    })
    console.log("SUCCESS bytes:", blob.size, "type:", blob.type)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.log("FAILED:", message.slice(0, 500))
  }
}

await tryProvider("auto")
await tryProvider("hf-inference")
await tryProvider("fal-ai")
await tryProvider("replicate")
