import Anthropic from '@anthropic-ai/sdk'
import 'dotenv/config'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export async function evaluateAnswer(
  question: string,
  userAnswer: string,
  referenceAnswers: string[]
): Promise<{ score: number; feedback: string }> {
  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 1000,
    messages: [
      {
        role: 'user',
        content: `Ты оцениваешь ответ на вопрос с собеседования.

Вопрос: ${question}

Эталонные ответы:
${referenceAnswers.map((a, i) => `${i + 1}. ${a}`).join('\n')}

Ответ пользователя: ${userAnswer}

Оцени ответ от 0 до 10 и дай краткий фидбек.
Отвечай ТОЛЬКО валидным JSON без markdown, без \`\`\`json, без пояснений.:
{"score": число, "feedback": "текст"}`
      }
    ]
  })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''

    const clean = text.replace(/```json|```/g, '').trim()
    return JSON.parse(clean)
}
