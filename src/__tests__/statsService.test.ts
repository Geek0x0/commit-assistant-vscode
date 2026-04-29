import { getStats, recordUsage, clearStats, buildTooltipText } from '../services/statsService';
import { setUiLanguage } from '../i18n';
import type { StatsData } from '../types';

function createMockMemento(data?: StatsData) {
  let store: unknown = data ?? undefined;
  return {
    get: jest.fn((key: string) => (key === 'commitAssistant.stats' ? store : undefined)),
    update: jest.fn(async (_key: string, value: unknown) => {
      store = value;
    }),
    _getStore: () => store
  };
}

describe('getStats', () => {
  test('returns empty stats for undefined store', () => {
    const memento = createMockMemento();
    expect(getStats(memento as never)).toEqual({ models: {} });
  });

  test('returns stored stats', () => {
    const data: StatsData = { models: { 'gpt-4.1': { daily: { '2025-01-01': 3 }, monthly: { '2025-01': 3 } } } };
    const memento = createMockMemento(data);
    expect(getStats(memento as never)).toEqual(data);
  });

  test('returns empty stats for invalid data shape', () => {
    const memento = createMockMemento({ models: [] } as unknown as StatsData);
    expect(getStats(memento as never)).toEqual({ models: {} });
  });

  test('returns empty stats when models field is missing', () => {
    const memento = createMockMemento({} as unknown as StatsData);
    expect(getStats(memento as never)).toEqual({ models: {} });
  });

  test('returns empty stats when daily/monthly have non-number values', () => {
    const memento = createMockMemento({
      models: { 'gpt-4.1': { daily: { '2025-01-01': 'bad' }, monthly: {} } }
    } as unknown as StatsData);
    expect(getStats(memento as never)).toEqual({ models: {} });
  });

  test('returns a deep copy (mutations do not affect cache)', () => {
    const data: StatsData = { models: { 'gpt-4.1': { daily: { '2025-01-01': 1 }, monthly: { '2025-01': 1 } } } };
    const memento = createMockMemento(data);
    const stats = getStats(memento as never);
    stats.models['gpt-4.1']!.daily['2025-01-01'] = 999;
    const stats2 = getStats(memento as never);
    expect(stats2.models['gpt-4.1']!.daily['2025-01-01']).toBe(1);
  });
});

describe('recordUsage', () => {
  test('creates new model entry on first use', async () => {
    const memento = createMockMemento();
    await recordUsage(memento as never, 'gpt-4.1');

    const store = memento._getStore() as StatsData;
    expect(store.models['gpt-4.1']).toBeDefined();
    const now = new Date();
    const dayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    expect(store.models['gpt-4.1'].daily[dayKey]).toBe(1);
  });

  test('increments existing model entry', async () => {
    const now = new Date();
    const dayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const data: StatsData = {
      models: { 'gpt-4.1': { daily: { [dayKey]: 2 }, monthly: { [monthKey]: 2 } } }
    };
    const memento = createMockMemento(data);
    await recordUsage(memento as never, 'gpt-4.1');

    const store = memento._getStore() as StatsData;
    expect(store.models['gpt-4.1'].daily[dayKey]).toBe(3);
    expect(store.models['gpt-4.1'].monthly[monthKey]).toBe(3);
  });

  test('tracks multiple models independently', async () => {
    const memento = createMockMemento();
    await recordUsage(memento as never, 'gpt-4.1');
    await recordUsage(memento as never, 'claude-sonnet');

    const store = memento._getStore() as StatsData;
    expect(Object.keys(store.models)).toHaveLength(2);
    expect(store.models['gpt-4.1']).toBeDefined();
    expect(store.models['claude-sonnet']).toBeDefined();
  });
});

describe('clearStats', () => {
  test('clears all stats', async () => {
    const data: StatsData = { models: { 'gpt-4.1': { daily: { '2025-01-01': 5 }, monthly: { '2025-01': 5 } } } };
    const memento = createMockMemento(data);
    await clearStats(memento as never);

    expect(memento._getStore()).toBeUndefined();
  });
});

describe('buildTooltipText', () => {
  beforeEach(() => {
    setUiLanguage('en');
  });

  test('returns no-data message when empty', () => {
    const text = buildTooltipText({ models: {} });
    expect(text).toContain('No usage data yet.');
  });

  test('includes model name and counts in markdown table', () => {
    const now = new Date();
    const dayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const stats: StatsData = {
      models: { 'gpt-4.1': { daily: { [dayKey]: 3, '2025-06-01': 2 }, monthly: { [monthKey]: 3 } } }
    };

    const text = buildTooltipText(stats);
    expect(text).toContain('| gpt-4.1 | 5 | 3 | 3 |');
    expect(text).toContain('Today');
    expect(text).toContain('This Month');
  });
});
