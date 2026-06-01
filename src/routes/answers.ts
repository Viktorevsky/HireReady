import { FastifyInstance } from 'fastify'
import prisma from '../prisma.js'
import { getEmbedding } from '../services/voyage.js'
import { evaluateAnswer } from '../services/claude.js'

export default async function answersRoutes(app: FastifyInstance) {
  app.post('/answers', async (request) => {
    const { questionId, userAnswer } = request.body as 
    { questionId: number; userAnswer: string }

    const embedding = await getEmbedding(userAnswer)

    const similarAnswers: any[] = await prisma.$queryRaw`
        SELECT body FROM reference_answers
        ORDER BY embedding <=> ${JSON.stringify(embedding)}::vector
        LIMIT 3
    `

    const question: any = await prisma.question.findUnique({
      where: { id: questionId }
    })

    const result = await evaluateAnswer(question.body, userAnswer, similarAnswers.map((a:any) => a.body))

    return prisma.sessionAnswer.create({
      data: {
        questionId,
        userAnswer,
        aiScore: result.score,
        aiFeedback: result.feedback,
      } as any
  })
})
}