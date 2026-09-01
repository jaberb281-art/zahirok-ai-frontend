import fs from "node:fs"
import { Client } from "@gradio/client"

const SPACE = process.env.HF_MUSICGEN_SPACE ?? "facebook/MusicGen"

let token = process.env.HF_TOKEN ?? ""
if (!token && fs.existsSync(".env.local")) {
  for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const match = line.match(/^HF_TOKEN=(.*)$/)
    if (match) {
      token = match[1].trim().replace(/^["']|["']$/g, "")
    }
  }
}

console.log("=== Space inspection ===")
console.log("space:", SPACE)
console.log("token_present:", Boolean(token))

const connectOptions = token ? { token } : {}

let client
try {
  client = await Client.connect(SPACE, connectOptions)
  console.log("connect: OK")
} catch (error) {
  console.log("connect: FAILED", error instanceof Error ? error.message : String(error))
  process.exit(1)
}

const api = await client.view_api()
console.log("\n=== named_endpoints ===")
console.log(Object.keys(api.named_endpoints ?? {}))

console.log("\n=== unnamed_endpoints ===")
console.log(Object.keys(api.unnamed_endpoints ?? {}))

for (const [name, info] of Object.entries(api.named_endpoints ?? {})) {
  console.log(`\n--- Endpoint: ${name} ---`)
  console.log(JSON.stringify(info, null, 2))
}

// Attempt predict on each named endpoint with minimal payload from api info
for (const [name, info] of Object.entries(api.named_endpoints ?? {})) {
  const params = info.parameters ?? []
  const payload = {}
  for (const param of params) {
    const key = param.parameter_name
    if (param.type?.type === "string") {
      payload[key] = "classical orchestration with elegant melody"
    } else if (param.python_type?.type === "filepath") {
      payload[key] = null
    } else {
      payload[key] = param.example_input ?? null
    }
  }

  console.log(`\n=== Trying predict ${name} ===`)
  console.log("payload:", JSON.stringify(payload))

  try {
    const result = await client.predict(name, payload)
    console.log("predict: SUCCESS")
    console.log("result_type:", typeof result)
    console.log("result:", JSON.stringify(result, null, 2).slice(0, 2000))
    break
  } catch (error) {
    console.log(
      "predict: FAILED",
      error instanceof Error ? error.message : String(error),
    )
  }
}
