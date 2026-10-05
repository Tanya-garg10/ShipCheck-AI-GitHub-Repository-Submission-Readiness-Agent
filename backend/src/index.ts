import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { analyzeRouter } from './routes/analyze';
import { fixSuggestionRouter } from './routes/fixSuggestion';

const app = express();
const PORT = process.env.PORT ?? 3001;
const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:5173';

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(cors({
  origin: [FRONTEND_URL, 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:4173', 'http://localhost:4174'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json({ limit: '1mb' }));

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use('/api/analyze', analyzeRouter);
app.use('/api/fix-suggestion', fixSuggestionRouter);

// ─── Health check ────────────────────────────────────────────────────────────

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Global error handler ────────────────────────────────────────────────────

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[ShipCheck] Unhandled error:', err.message);
  console.error('[ShipCheck] Stack trace:', err.stack);
  res.status(500).json({ success: false, error: `Internal server error: ${err.message}` });
});

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`[ShipCheck] Backend running on http://localhost:${PORT}`);
  console.log(`[ShipCheck] GitHub token:     ${process.env.GITHUB_TOKEN ? 'configured' : 'not set (60 req/hr limit)'}`);
  console.log(`[ShipCheck] Featherless key: ${process.env.FEATHERLESS_API_KEY ? 'configured' : 'not set (AI disabled)'}`);
});

export default app;
