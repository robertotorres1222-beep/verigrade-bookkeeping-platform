import express from 'express'
import cors from 'cors'
import { connectToDatabase } from './config/database'

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))
app.use(express.json())

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
})

// Basic API routes
app.get('/api', (req, res) => {
  res.json({ 
    message: 'VeriGrade API is running',
    endpoints: [
      'GET /health - Health check',
      'GET /api - API information'
    ]
  })
})

// Connect to database and start server
async function startServer() {
  try {
    await connectToDatabase()
    
    app.listen(PORT, () => {
      console.log(`🚀 VeriGrade Backend API running on port ${PORT}`)
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`)
      console.log(`🔗 Health check: http://localhost:${PORT}/health`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()