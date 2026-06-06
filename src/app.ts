import Fastify from 'fastify'
import cors from '@fastify/cors'
import categoriesRoutes from './routes/categories.js'
import questionsRoutes from './routes/questions.js'
import answersRoutes from './routes/answers.js'
import sessionsRoutes from './routes/sessions.js'
import mockRoutes from './routes/mock.js'

const app = Fastify({ logger: true })

app.register(cors, {
  origin: 'http://localhost:5173',
})

app.register(categoriesRoutes)
app.register(questionsRoutes)
app.register(answersRoutes)
app.register(sessionsRoutes)
app.register(mockRoutes)

export default app