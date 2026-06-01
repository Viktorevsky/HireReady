import Fastify from 'fastify'
import categoriesRoutes from './routes/categories.js'
import questionsRoutes from './routes/questions.js'
import answersRoutes from './routes/answers.js'
const app = Fastify({ logger: true })

app.register(categoriesRoutes)
app.register(questionsRoutes)
app.register(answersRoutes)

export default app