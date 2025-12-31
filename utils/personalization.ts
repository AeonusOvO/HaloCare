export type CardId =
  | 'smart_dashboard'
  | 'seasonal_diet'
  | 'exercise_plan'
  | 'emotion_regulation'
  | 'quick_services';

export interface HabitStats {
  impressions: number;
  clicks: number;
  lastInteractedAt?: number;
}

interface HabitModel {
  [cardId: string]: HabitStats;
}

const STORAGE_PREFIX = 'habit_model_';

function loadModel(userId: string): HabitModel {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + userId);
    if (!raw) return {};
    return JSON.parse(raw) as HabitModel;
  } catch {
    return {};
  }
}

function saveModel(userId: string, model: HabitModel) {
  localStorage.setItem(STORAGE_PREFIX + userId, JSON.stringify(model));
}

export function recordImpression(userId: string, cardId: CardId) {
  const m = loadModel(userId);
  const prev = m[cardId] || { impressions: 0, clicks: 0 };
  m[cardId] = { ...prev, impressions: prev.impressions + 1 };
  saveModel(userId, m);
}

export function recordClick(userId: string, cardId: CardId) {
  const m = loadModel(userId);
  const prev = m[cardId] || { impressions: 0, clicks: 0 };
  m[cardId] = {
    impressions: prev.impressions,
    clicks: prev.clicks + 1,
    lastInteractedAt: Date.now(),
  };
  saveModel(userId, m);
}

function thompsonSample(alpha: number, beta: number) {
  const u1 = Math.random();
  const u2 = Math.random();
  return Math.pow(u1, 1 / alpha) / (Math.pow(u1, 1 / alpha) + Math.pow(u2, 1 / beta));
}

export function sortByPreference(userId: string, cardIds: CardId[]): CardId[] {
  const m = loadModel(userId);
  const now = Date.now();
  const scored = cardIds.map((id) => {
    const s = m[id] || { impressions: 0, clicks: 0, lastInteractedAt: 0 };
    const impressions = Math.max(0, s.impressions);
    const clicks = Math.max(0, s.clicks);
    const alpha = 1 + clicks;
    const beta = 1 + Math.max(0, impressions - clicks);
    const sample = thompsonSample(alpha, beta);
    const recencyDays = s.lastInteractedAt ? (now - s.lastInteractedAt) / (1000 * 60 * 60 * 24) : Infinity;
    const recencyWeight = isFinite(recencyDays) ? Math.exp(-0.15 * recencyDays) : 0.6;
    const score = sample * 0.8 + recencyWeight * 0.2;
    return { id, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.map((s) => s.id);
}

export function resetModel(userId: string) {
  localStorage.removeItem(STORAGE_PREFIX + userId);
}

export function setModelForUser(userId: string, model: HabitModel) {
  saveModel(userId, model || {});
}
