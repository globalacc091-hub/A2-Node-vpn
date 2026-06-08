import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildClientConfig, buildServerConfig, generateWireGuardKeyPair } from '../vpn-core/index.js';
import { getPricingPlans, createCheckoutSession } from '../billing/stripe.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));

let connected = false;
let sessionStart = null;
const metrics = {
  download: 0,
  upload: 0,
  dataGB: 0,
  ping: 0,
  serverLoad: 34,
  uptime: 99.97,
};

function formatSessionTime() {
  if (!sessionStart) return '00:00:00';
  const elapsed = Math.floor((Date.now() - sessionStart) / 1000);
  const hours = String(Math.floor(elapsed / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
  const seconds = String(elapsed % 60).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

function refreshMetrics() {
  if (!connected) {
    metrics.download = 0;
    metrics.upload = 0;
    metrics.ping = 0;
    return;
  }

  metrics.ping = 20 + Math.floor(Math.random() * 12);
  metrics.download = Math.max(65, Math.min(110, metrics.download + Math.round(Math.random() * 8 - 3)));
  metrics.upload = Math.max(18, Math.min(48, metrics.upload + Math.round(Math.random() * 6 - 2)));
  metrics.serverLoad = Math.max(24, Math.min(58, metrics.serverLoad + Math.round(Math.random() * 4 - 2)));
  metrics.dataGB += (metrics.download + metrics.upload) / 1024;
}

setInterval(refreshMetrics, 1200);

app.get('/api/status', (req, res) => {
  res.json({
    connected,
    server: {
      country: 'Germany',
      city: 'Frankfurt',
      flag: '🇩🇪',
      protocol: 'WireGuard',
      uptime: '99.97%',
      premium: true,
    },
    plan: {
      name: 'FREE',
      badge: 'FREE',
    },
    metrics: {
      ping: connected ? `${metrics.ping}ms` : '—',
      download: connected ? metrics.download : 0,
      upload: connected ? metrics.upload : 0,
      dataUsed: connected ? metrics.dataGB.toFixed(2) : '0.00',
      sessionTime: formatSessionTime(),
    },
  });
});

app.post('/api/connect', (req, res) => {
  if (!connected) {
    connected = true;
    sessionStart = Date.now();
    metrics.dataGB = 0;
    metrics.download = 87;
    metrics.upload = 34;
    metrics.ping = 24;
  }
  res.json({ connected, status: 'connected' });
});

app.post('/api/disconnect', (req, res) => {
  connected = false;
  sessionStart = null;
  metrics.download = 0;
  metrics.upload = 0;
  metrics.dataGB = 0;
  metrics.ping = 0;
  res.json({ connected, status: 'disconnected' });
});

app.get('/api/metrics', (req, res) => {
  res.json({
    connected,
    ping: connected ? `${metrics.ping}ms` : '—',
    download: metrics.download,
    upload: metrics.upload,
    dataUsed: connected ? metrics.dataGB.toFixed(2) : '0.00',
    sessionTime: formatSessionTime(),
    serverLoad: `${metrics.serverLoad}%`,
  });
});

app.get('/api/server', (req, res) => {
  res.json({
    country: 'Germany',
    city: 'Frankfurt',
    flag: '🇩🇪',
    ping: `${connected ? metrics.ping : 24}ms`,
    serverLoad: `${metrics.serverLoad}%`,
    protocol: 'WireGuard',
    uptime: '99.97%',
    premium: true,
  });
});

app.get('/api/vpn-config', (req, res) => {
  const serverKeys = generateWireGuardKeyPair();
  const clientKeys = generateWireGuardKeyPair();
  const host = req.headers.host || 'vpn.a2node.local';

  const serverConfig = buildServerConfig({
    privateKey: serverKeys.privateKey,
    peer: {
      publicKey: clientKeys.publicKey,
      allowedIPs: ['10.200.200.2/32'],
      endpoint: host,
    },
  });
  const clientConfig = buildClientConfig({
    privateKey: clientKeys.privateKey,
    publicKey: serverKeys.publicKey,
    endpoint: host,
    allowedIPs: ['0.0.0.0/0', '::/0'],
  });

  res.json({
    connected,
    serverConfig,
    clientConfig,
  });
});

app.get('/api/billing/plans', (req, res) => {
  res.json(getPricingPlans());
});

app.post('/api/billing/checkout', async (req, res) => {
  try {
    const { planId } = req.body;
    const origin = req.headers.origin || `http://localhost:${PORT}`;
    const session = await createCheckoutSession(planId, origin);
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Could not create checkout session' });
  }
});

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`A2 Node backend running at http://localhost:${PORT}`);
});
