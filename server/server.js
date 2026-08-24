import express from 'express';
import cors from 'cors';

import { connectDatabase } from './config/database.js';
import { env } from './config/env.js';

import meetingRoutes from './routes/meetingRoutes.js';
import actionItemRoutes from './routes/actionItemRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import askRoutes from './routes/askRoutes.js';
import exportRoutes from './routes/exportRoutes.js';

import { errorHandler } from './middleware/errorHandler.js';


// ============================================================
// VALIDATE ENVIRONMENT
// ============================================================

env.validate();


// ============================================================
// INITIALIZE EXPRESS
// ============================================================

const app = express();


// ============================================================
// GLOBAL MIDDLEWARE
// ============================================================

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true
  })
);

app.use(
  express.json({
    limit: '2mb'
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: '2mb'
  })
);


// ============================================================
// REQUEST LOGGING
// ============================================================

app.use(
  (req, res, next) => {
    const start = Date.now();

    res.on(
      'finish',
      () => {
        const duration =
          Date.now() - start;

        console.log(
          `${new Date().toISOString()} ` +
          `${req.method} ${req.originalUrl} ` +
          `${res.statusCode} ` +
          `${duration}ms`
        );
      }
    );

    next();
  }
);


// ============================================================
// HEALTH CHECK
// ============================================================

app.get(
  '/api/health',
  (req, res) => {
    res.json({
      success: true,
      status: 'ok',
      timestamp:
        new Date().toISOString(),
      service:
        'MeetingIQ API',
      version:
        '1.0.0',
      environment:
        env.NODE_ENV,
      demoMode:
        env.DEMO_MODE
    });
  }
);


// ============================================================
// API ROUTES
// ============================================================

app.use(
  '/api/meetings',
  meetingRoutes
);

app.use(
  '/api/action-items',
  actionItemRoutes
);

app.use(
  '/api/analytics',
  analyticsRoutes
);

app.use(
  '/api/ask',
  askRoutes
);

app.use(
  '/api/export',
  exportRoutes
);


// ============================================================
// 404 HANDLER
// ============================================================

app.use(
  (req, res) => {
    res.status(404).json({
      success: false,
      error: 'Not Found',
      message:
        `Route ${req.method} ${req.originalUrl} not found`
    });
  }
);


// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================

app.use(
  errorHandler
);


// ============================================================
// START SERVER
// ============================================================

const PORT = env.PORT || 3000;

async function startServer() {
  try {
    const connection =
      await connectDatabase();

    if (!connection) {
      console.warn(
        '⚠️ Server is starting without an active MongoDB connection.'
      );
    }

    app.listen(
      PORT,
      () => {
        console.log('');
        console.log(
          '========================================'
        );
        console.log(
          '       🎙️ MeetingIQ API Server'
        );
        console.log(
          '========================================'
        );

        console.log(
          `✅ Server: http://localhost:${PORT}`
        );

        console.log(
          `🏥 Health: http://localhost:${PORT}/api/health`
        );

        console.log(
          `📚 API: http://localhost:${PORT}/api`
        );

        console.log(
          `🤖 ASR: ${env.ASR_PROVIDER}`
        );

        console.log(
          `🧠 LLM: ${env.GEMINI_MODEL || 'Not configured'}`
        );

        console.log(
          `🔄 Demo Mode: ${env.DEMO_MODE}`
        );

        console.log(
          '========================================'
        );
        console.log('');
      }
    );
  } catch (error) {
    console.error(
      '❌ Failed to start MeetingIQ server:',
      error
    );

    process.exit(1);
  }
}

startServer();

export default app;