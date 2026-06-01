export async function getEmbedding(text: string): Promise<number[]> {
    await new Promise(resolve => setTimeout(resolve, 21000))

  const response = await fetch('https://api.voyageai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.VOYAGE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'voyage-code-3',
      input: text,
    }),
  })

  const data = await response.json() as any
    return data.data[0].embedding
}