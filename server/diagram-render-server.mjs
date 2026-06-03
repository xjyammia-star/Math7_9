import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import { spawnSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = Number(process.env.DIAGRAM_RENDER_PORT || 4312);
const pythonCandidates = [
  process.env.PYTHON_BIN,
  'python',
  'py',
].filter(Boolean);

app.use(express.json({ limit: '256kb' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'diagram-render-server' });
});

function renderWithPython(payload) {
  const scriptPath = path.join(__dirname, 'circle_diagram_renderer.py');
  const input = JSON.stringify(payload);
  let lastError = null;

  for (const pythonBin of pythonCandidates) {
    const result = spawnSync(pythonBin, [scriptPath], {
      input,
      encoding: 'utf8',
      maxBuffer: 2 * 1024 * 1024,
    });

    if (!result.error && result.status === 0) {
      const svg = String(result.stdout || '').trim();
      if (svg.startsWith('<svg')) {
        return svg;
      }
      lastError = new Error('Python renderer returned an invalid SVG payload');
      continue;
    }

    lastError = result.error || new Error(String(result.stderr || 'python renderer failed'));
  }

  throw lastError || new Error('No Python interpreter available');
}

app.post('/api/render-diagram', (req, res) => {
  try {
    const payload = req.body ?? {};
    const template = String(payload.template ?? payload.type ?? '').trim();
    if (!template.startsWith('circle')) {
      return res.status(400).json({
        ok: false,
        error: 'Only circle* templates are supported by the Python renderer.',
      });
    }

    const svg = renderWithPython(payload);
    res.type('image/svg+xml').send(svg);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ ok: false, error: message });
  }
});

app.listen(port, '127.0.0.1', () => {
  console.log(`[diagram-render-server] listening on http://127.0.0.1:${port}`);
});
