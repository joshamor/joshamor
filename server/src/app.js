
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'

// Routes
import productRoutes from './routes/productRoutes.js'
import categoryRoutes from './routes/categoryRoutes.js'
import adminAuthRoutes from './routes/adminAuthRoutes.js'
import adminProductRoutes from './routes/adminProductRoutes.js'

const app = express()

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
].filter(Boolean)

app.use(helmet())

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true)
      }

      return callback(new Error('Origin not allowed by CORS'))
    },
    credentials: true,
  })
)

app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())

app.use('/api/products', productRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/admin/auth', adminAuthRoutes)
app.use('/api/admin/products', adminProductRoutes)

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'JOSH AMOR API is running',
  })
})

export default app
