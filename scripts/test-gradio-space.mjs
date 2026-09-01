async function generate() {
  const space = "https://facebook-musicgen.hf.space"
  const start = await fetch(`${space}/gradio_api/call/predict_batched`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      data: ["classical orchestration with elegant melody", null],
    }),
  })

  const { event_id: eventId } = await start.json()
  console.log("event_id", eventId)

  for (let attempt = 0; attempt < 60; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 3000))
    const poll = await fetch(`${space}/gradio_api/call/predict_batched/${eventId}`)
    const text = await poll.text()
    console.log("poll", attempt, poll.status, text.slice(0, 500))
    if (text.includes("event: complete") || text.includes('"url"')) {
      break
    }
  }
}

await generate()
