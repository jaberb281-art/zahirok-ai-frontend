import { Client } from "@gradio/client"

async function testCall(label, payload) {
  console.log(`\n=== ${label} ===`)
  try {
    const client = await Client.connect("facebook/MusicGen")
    const result = await client.predict("/predict_batched", payload)
    console.log("OK", JSON.stringify(result).slice(0, 800))
  } catch (error) {
    console.log("ERR", error instanceof Error ? error.message : String(error))
  }
}

await testCall("single strings", {
  texts: "classical orchestration with elegant melody",
  melodies: null,
})
await testCall("array batch", {
  texts: ["classical orchestration with elegant melody"],
  melodies: [null],
})
await testCall("named melody omitted", {
  texts: "classical orchestration with elegant melody",
})
