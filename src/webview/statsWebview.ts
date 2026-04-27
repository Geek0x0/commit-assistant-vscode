import * as vscode from 'vscode';
import type { StatsData } from '../types';
import { getStats } from '../services/statsService';
import { t } from '../i18n';

export function openStatsWebview(context: vscode.ExtensionContext): void {
  const panel = vscode.window.createWebviewPanel(
    'commitAssistant.stats',
    t().stats.webviewTitle,
    vscode.ViewColumn.One,
    { enableScripts: false }
  );

  const stats = getStats(context.globalState);
  panel.webview.html = buildStatsHtml(stats);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function buildStatsHtml(stats: StatsData): string {
  const models = Object.keys(stats.models);

  if (models.length === 0) {
    return wrapHtml(`
      <h1>${escapeHtml(t().stats.webviewTitle)}</h1>
      <p>${escapeHtml(t().stats.noData)}</p>
    `);
  }

  const totalHtml = buildTotalSection(stats, models);
  const dailyHtml = buildDailySection(stats, models);
  const monthlyHtml = buildMonthlySection(stats, models);

  return wrapHtml(totalHtml + dailyHtml + monthlyHtml);
}

function buildTotalSection(stats: StatsData, models: string[]): string {
  const tr = t().stats;
  let html = `<div class="summary"><h2>${escapeHtml(tr.totalLabel)}</h2>`;

  for (const model of models) {
    const dailyTotal = Object.values(stats.models[model].daily).reduce((s, c) => s + c, 0);
    html += `<div class="summary-item"><strong>${escapeHtml(model)}</strong>: ${dailyTotal}</div>`;
  }

  html += '</div>';
  return html;
}

function buildDailySection(stats: StatsData, models: string[]): string {
  const tr = t().stats;
  const rows = models.flatMap((model) =>
    Object.entries(stats.models[model].daily)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([date, count]) => ({ model, label: date, count }))
  );

  return buildTable(tr.dailyTitle, [tr.model, tr.date, tr.count, ''], rows);
}

function buildMonthlySection(stats: StatsData, models: string[]): string {
  const tr = t().stats;
  const rows = models.flatMap((model) =>
    Object.entries(stats.models[model].monthly)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([period, count]) => ({ model, label: period, count }))
  );

  return buildTable(tr.monthlyTitle, [tr.model, tr.period, tr.count, ''], rows);
}

function buildTable(
  title: string,
  headers: string[],
  rows: { model: string; label: string; count: number }[]
): string {
  if (rows.length === 0) {
    return '';
  }

  const maxCount = Math.max(...rows.map((r) => r.count), 1);

  let html = `<h2>${escapeHtml(title)}</h2><table><thead><tr>`;
  for (const h of headers) {
    html += `<th>${escapeHtml(h)}</th>`;
  }
  html += '</tr></thead><tbody>';

  for (const row of rows) {
    const pct = Math.round((row.count / maxCount) * 100);
    html += `<tr>
      <td>${escapeHtml(row.model)}</td>
      <td>${escapeHtml(row.label)}</td>
      <td>${row.count}</td>
      <td style="width: 40%;">
        <div class="bar-container">
          <div class="bar" style="width: ${pct}%;"></div>
        </div>
      </td>
    </tr>`;
  }

  html += '</tbody></table>';
  return html;
}

function wrapHtml(body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body {
    color: var(--vscode-editor-foreground);
    background-color: var(--vscode-editor-background);
    font-family: var(--vscode-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
    padding: 20px;
    line-height: 1.5;
  }
  h1, h2 {
    color: var(--vscode-editor-foreground);
    margin-top: 24px;
    margin-bottom: 12px;
  }
  h1 { font-size: 1.5em; }
  h2 { font-size: 1.2em; }
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 8px;
    margin-bottom: 24px;
  }
  th, td {
    padding: 8px 12px;
    text-align: left;
    border-bottom: 1px solid var(--vscode-panel-border, #333);
  }
  th {
    font-weight: 600;
    color: var(--vscode-foreground);
    background-color: var(--vscode-editor-inactiveSelectionBackground, rgba(128,128,128,0.1));
  }
  .summary-item {
    padding: 10px 12px;
    border: 1px solid var(--vscode-panel-border, #333);
    border-radius: 4px;
    margin-bottom: 8px;
    background-color: var(--vscode-editor-inactiveSelectionBackground, rgba(128,128,128,0.05));
  }
  .bar-container {
    width: 100%;
    background-color: var(--vscode-panel-border, #444);
    height: 12px;
    border-radius: 2px;
    overflow: hidden;
  }
  .bar {
    height: 100%;
    background-color: var(--vscode-button-background, #0e639c);
    border-radius: 2px;
    transition: width 0.2s ease;
  }
</style>
</head>
<body>
${body}
</body>
</html>`;
}
