
import 'dotenv/config'
import app from './app.js'
import { connectDatabase } from './config/database.js'
import { startAbandonedCartScheduler } from './services/abandonedCartScheduler.js'

const PORT = process.env.PORT || 5000

async function startServer() {
  await connectDatabase()
    startAbandonedCartScheduler()

  app.listen(PORT, () => {
    console.log(`JOSH AMOR API running on port ${PORT}`)
  })
}

startServer()
