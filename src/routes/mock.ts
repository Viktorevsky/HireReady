import { FastifyInstance } from 'fastify'
import { randomUUID } from 'crypto'
import prisma from '../prisma.js'
import redis from '../redis.js'
import { getEmbedding } from '../services/voyage.js'
import { evaluateAnswer } from '../services/claude.js'

// Тип для данных сессии, которые живут в Redis
type MockSession = {
  status: 'in_progress' | 'completed'
  categoryId: number
  questionIds: number[]
  currentIndex: number
  answers: Array<{
    questionId: number
    userAnswer: string
  }>
  createdAt: number
}

export default async function mockRoutes(app: FastifyInstance) {
  // POST /mock/sessions — создать сессию интервью
  app.post('/mock/sessions', async (request, reply) => {
    const { categoryId, questionCount } = request.body as {
      categoryId: number
      questionCount: number
    }

    const questions = await prisma.question.findMany({
      where: { categoryId },
      select: { id: true },
    })

    if (questions.length === 0) {
      return reply.status(400).send({ error: 'Нет вопросов в этой категории' })
    }

    // Fisher-Yates shuffle — случайный порядок вопросов
    const shuffled = [...questions].sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, Math.min(questionCount, questions.length))
    const questionIds = selected.map(q => q.id)

    const sessionId = randomUUID()
    const session: MockSession = {
      status: 'in_progress',
      categoryId,
      questionIds,
      currentIndex: 0,
      answers: [],
      createdAt: Date.now(),
    }

    // EX 7200 — сессия живёт 2 часа, потом Redis удалит сам
    await redis.set(`mock:${sessionId}`, JSON.stringify(session), 'EX', 7200)

    const firstQuestion = await prisma.question.findUnique({
      where: { id: questionIds[0] },
    })

    return {
      sessionId,
      totalQuestions: questionIds.length,
      currentIndex: 0,
      question: firstQuestion,
    }
  })

  // POST /mock/sessions/:id/answers — ответить на текущий вопрос
  app.post('/mock/sessions/:id/answers', async (request, reply) => {
    const { id } = request.params as { id: string }
    const { questionId, userAnswer } = request.body as {
      questionId: number
      userAnswer: string
    }

    const raw = await redis.get(`mock:${id}`)
    if (!raw) return reply.status(404).send({ error: 'Сессия не найдена' })

    const session: MockSession = JSON.parse(raw)

    // State machine: нельзя добавить ответ к завершённой сессии
    if (session.status === 'completed') {
      return reply.status(400).send({ error: 'Сессия уже завершена' })
    }

    // Записываем ответ — без оценки (deferred evaluation)
    session.answers.push({ questionId, userAnswer })
    session.currentIndex++

    const isLastQuestion = session.currentIndex >= session.questionIds.length

    if (isLastQuestion) {
      session.status = 'completed'
      await redis.set(`mock:${id}`, JSON.stringify(session), 'EX', 7200)
      return { finished: true }
    }

    // Возвращаем следующий вопрос
    const nextQuestion = await prisma.question.findUnique({
      where: { id: session.questionIds[session.currentIndex] },
    })

    await redis.set(`mock:${id}`, JSON.stringify(session), 'EX', 7200)

    return {
      finished: false,
      currentIndex: session.currentIndex,
      totalQuestions: session.questionIds.length,
      question: nextQuestion,
    }
  })

  // GET /mock/sessions/:id/report — финальный отчёт
  // Вызывается ОДИН раз после завершения — здесь происходит вся оценка
  app.get('/mock/sessions/:id/report', async (request, reply) => {
    const { id } = request.params as { id: string }

    const raw = await redis.get(`mock:${id}`)
    if (!raw) return reply.status(404).send({ error: 'Сессия не найдена' })

    const session: MockSession = JSON.parse(raw)

    if (session.status !== 'completed') {
      return reply.status(400).send({ error: 'Интервью ещё не завершено' })
    }

    const results = await Promise.all(
      session.answers.map(async (answer) => {
        const question = await prisma.question.findUnique({
          where: { id: answer.questionId },
        })

        const embedding = await getEmbedding(answer.userAnswer)

        const similarAnswers: any[] = await prisma.$queryRaw`
          SELECT body FROM reference_answers
          WHERE question_id = ${answer.questionId}
          ORDER BY embedding <=> ${JSON.stringify(embedding)}::vector
          LIMIT 3
        `

        const evaluation = await evaluateAnswer(
          question!.body,
          answer.userAnswer,
          similarAnswers.map((a: any) => a.body)
        )

        return {
          question: {
            id: question!.id,
            title: question!.title,
            body: question!.body,
            difficulty: question!.difficulty,
          },
          userAnswer: answer.userAnswer,
          aiScore: evaluation.score,
          aiFeedback: evaluation.feedback,
        }
      })
    )

    const totalScore = results.reduce((sum, r) => sum + r.aiScore, 0)
    const averageScore = Math.round((totalScore / results.length) * 10) / 10

    return {
      sessionId: id,
      totalQuestions: results.length,
      averageScore,
      answers: results,
    }
  })
}