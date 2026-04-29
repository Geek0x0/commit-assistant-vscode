import * as vscode from 'vscode';
import type { StatsData } from '../types';
import { t, formatTemplate } from '../i18n';

const STATS_KEY = 'commitAssistant.stats';

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatMonth(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function isValidStatsData(value: unknown): value is StatsData {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  if (!v.models || typeof v.models !== 'object' || Array.isArray(v.models)) return false;
  for (const entry of Object.values(v.models)) {
    if (!entry || typeof entry !== 'object') return false;
    const m = entry as Record<string, unknown>;
    if (!m.daily || typeof m.daily !== 'object' || Array.isArray(m.daily)) return false;
    if (!m.monthly || typeof m.monthly !== 'object' || Array.isArray(m.monthly)) return false;
    for (const count of Object.values(m.daily)) {
      if (typeof count !== 'number') return false;
    }
    for (const count of Object.values(m.monthly)) {
      if (typeof count !== 'number') return false;
    }
  }
  return true;
}

export function getStats(globalState: vscode.Memento): StatsData {
  const raw = globalState.get<StatsData>(STATS_KEY);
  if (!isValidStatsData(raw)) {
    return { models: {} };
  }
  return JSON.parse(JSON.stringify(raw)) as StatsData;
}

export async function recordUsage(globalState: vscode.Memento, model: string): Promise<void> {
  const stats = getStats(globalState);
  const now = new Date();
  const dayKey = formatDate(now);
  const monthKey = formatMonth(now);

  const modelStats = stats.models[model] ?? { daily: {}, monthly: {} };

  const newStats: StatsData = {
    models: {
      ...stats.models,
      [model]: {
        daily: {
          ...modelStats.daily,
          [dayKey]: (modelStats.daily[dayKey] ?? 0) + 1
        },
        monthly: {
          ...modelStats.monthly,
          [monthKey]: (modelStats.monthly[monthKey] ?? 0) + 1
        }
      }
    }
  };

  await globalState.update(STATS_KEY, newStats);
}

export async function clearStats(globalState: vscode.Memento): Promise<void> {
  await globalState.update(STATS_KEY, undefined);
}

export function buildTooltipText(stats: StatsData): string {
  const tr = t().stats;
  const models = Object.keys(stats.models);
  if (models.length === 0) {
    return `${tr.tooltipTitle}\n\n${tr.noData}`;
  }

  const now = new Date();
  const todayKey = formatDate(now);
  const thisMonthKey = formatMonth(now);

  const header = `| Model | Total | ${tr.today} | ${tr.thisMonth} |`;
  const sep = '|:------|------:|------:|----------:|';
  const rows = models.map((model) => {
    const ms = stats.models[model];
    const total = Object.values(ms.daily).reduce((sum, c) => sum + c, 0);
    const today = ms.daily[todayKey] ?? 0;
    const month = ms.monthly[thisMonthKey] ?? 0;
    return `| ${model} | ${total} | ${today} | ${month} |`;
  });

  return `${tr.tooltipTitle}\n\n${header}\n${sep}\n${rows.join('\n')}`;
}
