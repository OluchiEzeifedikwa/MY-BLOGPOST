import 'dotenv/config'
import { createServer } from 'http'
import express from 'express'
import cookieParser from 'cookie-parser'
import path from 'path'
import { fileURLToPath } from 'url'
import authRouter from './routes/auth.route.ts'
import postRouter from './routes/post.route.ts'
import commentRouter from './routes/comment.route.ts'
import { errorHandler } from './middleware/error.middleware.ts'
import { setupWebSocket } from './lib/websocket.ts'
    


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(cookieParser())
app.use(express.static(path.join(__dirname, '../public')))

app.use('/api/auth', authRouter)
app.use('/api/posts', postRouter)
app.use('/api/posts', commentRouter)

app.get('/', (_req, res) => {
  res.redirect('/signup.html')
})

app.use(errorHandler)

const server = createServer(app)
setupWebSocket(server)

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
