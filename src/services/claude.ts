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
        content: `Ты — опытный технический интервьюер. Оцени ответ кандидата.

Вопрос: ${question}

Эталонные ответы для ориентира:
${referenceAnswers.map((a, i) => `${i + 1}. ${a}`).join('\n')}

Ответ кандидата: ${userAnswer}

Правила оценки:
- Оценивай ТОЛЬКО техническое содержание — насколько ответ удовлетворит работодателя
- Грамматические и орфографические ошибки ИГНОРИРУЙ полностью
- Если суть верна но не хватает деталей — это 6-7, не 3
- 8-10: ответ полный, кандидата можно брать
- 5-7: суть понята, но поверхностно
- 1-4: серьёзные пробелы в понимании
- Фидбек пиши конструктивно — что добавить, а не что плохо
- Фидбек на русском, 2-3 предложения максимум

Отвечай ТОЛЬКО валидным JSON без markdown:
{"score": число, "feedback": "текст"}`
      }
    ]
  })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''

    const clean = text.replace(/```json|```/g, '').trim()
    return JSON.parse(clean)
}
