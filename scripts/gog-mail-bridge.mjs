#!/usr/bin/env node
import http from 'node:http';
import { spawn } from 'node:child_process';

const PORT = Number(process.env.GOG_MAIL_BRIDGE_PORT || 3011);
const HOST = process.env.GOG_MAIL_BRIDGE_HOST || '127.0.0.1';
const BRIDGE_TOKEN = process.env.GOG_MAIL_BRIDGE_TOKEN || '';
const GOG_ACCOUNT = process.env.GOG_MAIL_ACCOUNT || 'brian@ruffo.ai';

function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

function runGogSend({ to, subject, body, bodyHtml, replyTo }) {
  return new Promise((resolve, reject) => {
    const args = ['gmail', 'send', '--account', GOG_ACCOUNT, '--to', to, '--subject', subject, '--no-input'];

    if (body) args.push('--body', body);
    if (bodyHtml) args.push('--body-html', bodyHtml);
    if (replyTo) args.push('--reply-to', replyTo);

    const child = spawn('gog', args, {
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', reject);

    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }

      reject(new Error(`gog send failed with code ${code}: ${stderr || stdout}`));
    });
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/health') {
    sendJson(res, 200, { ok: true });
    return;
  }

  if (req.method !== 'POST' || req.url !== '/send') {
    sendJson(res, 404, { error: 'not_found' });
    return;
  }

  if (!BRIDGE_TOKEN || req.headers['x-bridge-token'] !== BRIDGE_TOKEN) {
    sendJson(res, 401, { error: 'unauthorized' });
    return;
  }

  let raw = '';
  req.on('data', (chunk) => {
    raw += chunk.toString();
  });

  req.on('end', async () => {
    try {
      const payload = JSON.parse(raw || '{}');
      const messages = Array.isArray(payload.messages) ? payload.messages : [];

      if (messages.length === 0) {
        sendJson(res, 400, { error: 'no_messages' });
        return;
      }

      const results = [];
      for (const message of messages) {
        if (!message?.to || !message?.subject || (!message?.body && !message?.bodyHtml)) {
          throw new Error('Each message requires to, subject, and body or bodyHtml');
        }

        const result = await runGogSend(message);
        results.push({ to: message.to, subject: message.subject, stdout: result.stdout, stderr: result.stderr });
      }

      sendJson(res, 200, { ok: true, count: results.length, results });
    } catch (error) {
      console.error('gog-mail-bridge error:', error);
      sendJson(res, 500, { error: error instanceof Error ? error.message : 'unknown_error' });
    }
  });
});

server.listen(PORT, HOST, () => {
  console.log(`gog mail bridge listening on http://${HOST}:${PORT}`);
});
