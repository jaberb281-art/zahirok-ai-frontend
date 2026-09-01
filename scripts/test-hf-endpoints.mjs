import fs from "node:fs"
import path from "node:path"

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

console.log("token_present:", Boolean(token), "len:", token.length)

async function test(url, body) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "audio/*, application/json",
      },
      body: JSON.stringify(body),
    })

    const contentType = response.headers.get("content-type") ?? ""
    let preview = ""
    if (contentType.includes("json")) {
      preview = await response.text()
    } else {
      preview = `[binary ${(await response.arrayBuffer()).byteLength} bytes]`
    }

    console.log("\nURL:", url)
    console.log("STATUS:", response.status, "CT:", contentType)
    console.log("BODY:", preview.slice(0, 800))
  } catch (error) {
    console.log("\nURL:", url)
    console.log("FETCH_ERROR:", error instanceof Error ? error.message : String(error))
  }
}

const body = {
  inputs: "classical orchestration with elegant melody",
  parameters: { duration: 10 },
}

await test(
  "https://api-inference.huggingface.co/models/facebook/musicgen-small",
  body,
)
await test(
  "https://router.huggingface.co/hf-inference/models/facebook/musicgen-small",
  body,
)
