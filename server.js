const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Supabase configuration check
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (supabaseUrl && supabaseAnonKey) {
  console.log('✅ Supabase configuration found');
  console.log(`📊 Supabase URL: ${supabaseUrl}`);
} else {
  console.log('⚠️  Supabase configuration missing - some features may not work');
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    service: 'VeriGrade Backend API'
  });
});

// API routes
app.get('/', (req, res) => {
  res.json({
    message: 'VeriGrade Backend API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      api: '/api'
    }
  });
});

// API endpoints
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'VeriGrade Backend',
    timestamp: new Date().toISOString(),
    supabase: supabaseUrl ? 'configured' : 'not configured'
  });
});

// Database test endpoint
app.get('/api/test-db', async (req, res) => {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      return res.status(500).json({
        success: false,
        message: 'Supabase not configured',
        error: 'Missing SUPABASE_URL or SUPABASE_ANON_KEY'
      });
    }

    // Simple test - you can expand this based on your needs
    res.json({
      success: true,
      message: 'Database connection test endpoint ready',
      supabase_url: supabaseUrl,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database test failed',
      error: error.message
    });
  }
});

// Serve backend files if they exist
app.use('/backend', express.static(path.join(__dirname, 'backend')));

// Start server
app.listen(PORT, () => {
  console.log(`🚀 VeriGrade Backend API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📁 Backend files served from: ${path.join(__dirname, 'backend')}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});