import 'dotenv/config'
import Anthropic from '@anthropic-ai/sdk'
import prisma from '../src/prisma.js'
import { getEmbedding } from '../src/services/voyage.js'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

async function generateQuestions(topic: string) {
  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1000,
    messages: [
      {
        role: 'user',
        content: `Сгенерируй 10 вопросов для собеседования по теме ${topic}.
Ответь ТОЛЬКО валидным JSON без markdown:
[{"title": "короткое название", "body": "полный текст вопроса", "difficulty": "EASY/MEDIUM/HARD"}]`
      }
    ]
  })
  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const clean = text.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}

async function generateReferenceAnswer(question: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 500,
    messages: [
      {
        role: 'user',
        content: `Напиши эталонный ответ на вопрос для собеседования: ${question}. Отвечай только текстом без markdown.`
      }
    ]
  })
  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  return text.trim()
}

async function main() {
  const topics = ['JavaScript', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker']

  for (const topic of topics) {
    console.log(`Генерирую вопросы по ${topic}...`)

    const category = await prisma.category.upsert({
      where: { slug: topic.toLowerCase().replace('.', '') },
      update: {},
      create: {
        name: topic,
        slug: topic.toLowerCase().replace('.', ''),
        description: `Вопросы по ${topic}`
      }
    })

    const questions = await generateQuestions(topic)

    for (const q of questions) {
      const question = await prisma.question.create({
        data: {
          title: q.title,
          body: q.body,
          difficulty: q.difficulty,
          categoryId: category.id,
          tags: []
        }
      })

      const referenceAnswer = await generateReferenceAnswer(q.body)

      await prisma.referenceAnswer.create({
        data: { questionId: question.id, body: referenceAnswer }
      })

      const embedding = await getEmbedding(referenceAnswer)
      await prisma.$executeRaw`
        UPDATE reference_answers
        SET embedding = ${JSON.stringify(embedding)}::vector
        WHERE question_id = ${question.id}
      `

      console.log(`✓ ${q.title}`)
    }
  }

  console.log('Готово!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())