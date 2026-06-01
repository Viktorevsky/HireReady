import { FastifyInstance } from 'fastify'
import prisma from '../prisma.js'

export default async function categoriesRoutes(app: FastifyInstance) {
  app.get('/categories', async () => {
    const categories = await prisma.category.findMany()
    return categories
  })
}