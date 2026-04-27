import * as vscode from 'vscode';
import * as https from 'https';
import * as http from 'http';
import { URL } from 'url';
import type { CustomModelConfig } from '../types';

const DEFAULT_TEMPERATURE = 0.7;
const DEFAULT_MAX_TOKENS = 4096;
const REQUEST_TIMEOUT_MS = 60000;

const ALLOWED_PROTOCOLS = ['https:', 'http:'];
const BLOCKED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0', '::1', '[::1]'];
const BLOCKED_IP_PATTERNS = [
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^169\.254\./,
  /^fc00:/i,
  /^fe80:/i
];

interface ChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message: string;
  };
}

export function isUrlAllowed(urlStr: string): boolean {
  let url: URL;
  try {
    url = new URL(urlStr);
  } catch {
    return false;
  }
  if (!ALLOWED_PROTOCOLS.includes(url.protocol)) {
    return false;
  }
  const hostname = url.hostname.toLowerCase();
  if (BLOCKED_HOSTS.includes(hostname)) {
    return false;
  }
  if (BLOCKED_IP_PATTERNS.some((p) => p.test(hostname))) {
    return false;
  }
  return true;
}

function sanitizeErrorMessage(message: string): string {
  return message
    .replace(/sk-[a-zA-Z0-9_-]{20,}/g, '[REDACTED_API_KEY]')
    .replace(/Bearer\s+\S+/g, 'Bearer [REDACTED]');
}

function makeRequest(
  urlStr: string,
  body: unknown,
  apiKey: string,
  token: vscode.CancellationToken
): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;

    const postData = JSON.stringify(body);

    const options: https.RequestOptions = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: REQUEST_TIMEOUT_MS
    };

    const req = client.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (token.isCancellationRequested) {
          reject(new vscode.CancellationError());
          return;
        }

        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const json = JSON.parse(data) as ChatCompletionResponse;
            if (json.error?.message) {
              reject(new Error(sanitizeErrorMessage(json.error.message)));
              return;
            }
            const content = json.choices?.[0]?.message?.content;
            if (typeof content !== 'string') {
              reject(new Error('Unexpected response format from custom model API'));
              return;
            }
            resolve(content);
          } catch {
            reject(new Error('Invalid JSON response from custom model API'));
          }
        } else {
          let message = `HTTP ${res.statusCode}`;
          try {
            const json = JSON.parse(data) as ChatCompletionResponse;
            if (json.error?.message) {
              message = json.error.message;
            }
          } catch {
            // ignore
          }
          reject(new Error(sanitizeErrorMessage(message)));
        }
      });
    });

    req.on('error', () => {
      reject(new Error('Custom model request failed. Please check your network and API configuration.'));
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timed out after 60s'));
    });

    const disposable = token.onCancellationRequested(() => {
      req.destroy();
      disposable.dispose();
      reject(new vscode.CancellationError());
    });

    req.write(postData);
    req.end();
  });
}

export async function generateWithCustomModel(
  prompt: string,
  config: CustomModelConfig,
  apiKey: string,
  token: vscode.CancellationToken
): Promise<{ message: string; modelName: string }> {
  const body = {
    model: config.model,
    messages: [{ role: 'user', content: prompt }],
    temperature: DEFAULT_TEMPERATURE,
    max_tokens: DEFAULT_MAX_TOKENS
  };

  const text = await makeRequest(config.url, body, apiKey, token);

  return {
    message: text,
    modelName: `${config.name} (${config.model})`
  };
}
