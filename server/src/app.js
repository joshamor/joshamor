
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'

// Routes
import productRoutes from './routes/productRoutes.js'
import categoryRoutes from './routes/categoryRoutes.js'
import adminAuthRoutes from './routes/adminAuthRoutes.js'
import adminProductRoutes from './routes/adminProductRoutes.js'
import adminInventoryRoutes from './routes/adminInventoryRoutes.js'
import guestCartRoutes from './routes/guestCartRoutes.js'
import guestOrderRoutes from './routes/guestOrderRoutes.js'
import flutterwaveWebhookRoutes from './routes/flutterwaveWebhookRoutes.js'
import adminOrderRoutes from './routes/adminOrderRoutes.js'

const app = express()

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  "https://www.joshamor.com",
  "http://www.joshamor.com",
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

app.use(express.json({
  limit: '1mb',
  verify: (req, res, buffer) => {
    req.rawBody = Buffer.from(buffer)
  },
}))
app.use(cookieParser())

app.use('/api/products', productRoutes)
app.use('/api/webhooks', flutterwaveWebhookRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/cart', guestCartRoutes)
app.use('/api/orders/guest', guestOrderRoutes)

//Admin
app.use('/api/admin/auth', adminAuthRoutes)
app.use('/api/admin/products', adminProductRoutes)
app.use('/api/admin/inventory', adminInventoryRoutes)
app.use('/api/admin/orders', adminOrderRoutes)


app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'JOSH AMOR API is running',
  })
})

export default app
