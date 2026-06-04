import { FastifyInstance } from 'fastify'
import { randomUUID } from 'crypto'
import redis from '../redis.js'

export default async function sessionsRoutes(app: FastifyInstance) {
  app.post('/sessions', async () => {
    const sessionId = randomUUID()
    await redis.set(sessionId, JSON.stringify({ createdAt: Date.now(), answers: [] }), 'EX', 3600)
    return { sessionId }
  })

  app.get('/sessions/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const data = await redis.get(id)
    if (!data) return reply.status(404).send({ error: 'Session not found' })
    return JSON.parse(data)
  })
}