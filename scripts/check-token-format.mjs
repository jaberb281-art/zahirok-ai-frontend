import fs from "node:fs"

const envPath = ".env.local"
if (!fs.existsSync(envPath)) {
  console.log("no env file")
  process.exit(0)
}

const match = fs.readFileSync(envPath, "utf8").match(/^HF_TOKEN=(.*)$/m)
if (!match) {
  console.log("no HF_TOKEN key")
  process.exit(0)
}

const token = match[1].trim().replace(/^["']|["']$/g, "")
console.log("starts_with_hf_:", token.startsWith("hf_"))
console.log("length:", token.length)
