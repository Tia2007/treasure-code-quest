const STORAGE_KEY = 'kid-treasure:v2'

export function createFreshState() {
  return {
    version: 2,
    eventTitle: '兒童節歡樂闖關',
    eventSubtitle: '一起合作累積分數，打開寶箱！',
    score: 0,
    stage1Target: 50,
    stage2Target: 100,
    ringPoints: 3,
    balloon1Points: 10,
    balloon2Points: 15,
    balloon3Points: 25,
    stage1Reward: '第一寶箱：小音樂盒',
    stage2Reward: '第二寶箱：卡比芭拉積木盲盒',
    goodbyeReward: '回家禮：流體熊',
    notes: '套圈圈：每套中一次 +3 分。\n氣球不落地：1 顆 +10、2 顆 +15、3 顆 +25。',
    history: [],
  }
}

function sanitizeNumber(value, fallback) {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function sanitizeState(raw) {
  const fresh = createFreshState()
  if (!raw || typeof raw !== 'object') return fresh

  return {
    ...fresh,
    eventTitle: typeof raw.eventTitle === 'string' ? raw.eventTitle : fresh.eventTitle,
    eventSubtitle: typeof raw.eventSubtitle === 'string' ? raw.eventSubtitle : fresh.eventSubtitle,
    score: Math.max(0, sanitizeNumber(raw.score, fresh.score)),
    stage1Target: Math.max(1, sanitizeNumber(raw.stage1Target, fresh.stage1Target)),
    stage2Target: Math.max(1, sanitizeNumber(raw.stage2Target, fresh.stage2Target)),
    ringPoints: Math.max(1, sanitizeNumber(raw.ringPoints, fresh.ringPoints)),
    balloon1Points: Math.max(1, sanitizeNumber(raw.balloon1Points, fresh.balloon1Points)),
    balloon2Points: Math.max(1, sanitizeNumber(raw.balloon2Points, fresh.balloon2Points)),
    balloon3Points: Math.max(1, sanitizeNumber(raw.balloon3Points, fresh.balloon3Points)),
    stage1Reward: typeof raw.stage1Reward === 'string' ? raw.stage1Reward : fresh.stage1Reward,
    stage2Reward: typeof raw.stage2Reward === 'string' ? raw.stage2Reward : fresh.stage2Reward,
    goodbyeReward: typeof raw.goodbyeReward === 'string' ? raw.goodbyeReward : fresh.goodbyeReward,
    notes: typeof raw.notes === 'string' ? raw.notes : fresh.notes,
    history: Array.isArray(raw.history) ? raw.history.slice(0, 40) : [],
  }
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const fresh = createFreshState()
      saveState(fresh)
      return fresh
    }
    const parsed = JSON.parse(raw)
    const next = sanitizeState(parsed)
    saveState(next)
    return next
  } catch {
    const fresh = createFreshState()
    saveState(fresh)
    return fresh
  }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitizeState(state)))
}
