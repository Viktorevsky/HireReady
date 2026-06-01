import { FastifyInstance } from 'fastify'
import prisma from '../prisma.js'

export default async function questionsRoutes(app: FastifyInstance) {
  app.get('/questions', async (request) => {
    const { categoryId, difficulty } = request.query as {
      categoryId?: string
      difficulty?: string
    }

    const questions = await prisma.question.findMany({
      where: {
        ...(categoryId && { categoryId: Number(categoryId) }),
        ...(difficulty && { difficulty: difficulty as any }),
      },
      include: { category: true },
    })

    return questions
  })

  app.get('/questions/:id', async (request, reply) => {
    const { id } = request.params as { id: string }

    const question = await prisma.question.findUnique({
      where: { id: Number(id) },
      include: { category: true },
    })

    if (!question) return reply.status(404).send({ error: 'Not found' })

    return question
  })
}