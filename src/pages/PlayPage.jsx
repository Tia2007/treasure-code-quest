import { useEffect, useMemo, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import { createFreshState, loadState, saveState } from '../lib/storage.js'

const ACTIONS = [
  { key: 'ring', label: '套圈圈套中 1 次', field: 'ringPoints', emoji: '⭕' },
  { key: 'balloon1', label: '1 顆氣球 30 秒成功', field: 'balloon1Points', emoji: '🎈' },
  { key: 'balloon2', label: '2 顆氣球 30 秒成功', field: 'balloon2Points', emoji: '🎈🎈' },
  { key: 'balloon3', label: '3 顆氣球 30 秒成功', field: 'balloon3Points', emoji: '🎈🎈🎈' },
]

export default function PlayPage() {
  const [state, setState] = useState(() => loadState())
  const [message, setMessage] = useState('準備好了就開始累積分數吧！')
  const [celebrationStage, setCelebrationStage] = useState(null)
  const [sparkles, setSparkles] = useState([])
  const audioRef = useRef(null)
  const timerRef = useRef(null)

  const stage1Open = state.score >= state.stage1Target
  const stage2Open = state.score >= state.stage2Target
  const totalPercent = useMemo(
    () => Math.min(100, Math.round((state.score / state.stage2Target) * 100)),
    [state.score, state.stage2Target],
  )

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
      if (audioRef.current) {
        audioRef.current.close().catch(() => {})
      }
    }
  }, [])

  function update(next, nextMessage = message) {
    saveState(next)
    setState(next)
    setMessage(nextMessage)
  }

  function playCelebrationMusic() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return

    if (!audioRef.current || audioRef.current.state === 'closed') {
      audioRef.current = new AudioCtx()
    }

    const ctx = audioRef.current
    if (ctx.state === 'suspended') ctx.resume().catch(() => {})

    const notes = [523.25, 659.25, 783.99, 1046.5]
    const now = ctx.currentTime

    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.exponentialRampToValueAtTime(0.18, now + index * 0.12 + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.12 + 0.22)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now + index * 0.12)
      osc.stop(now + index * 0.12 + 0.24)
    })
  }

  function triggerCelebration(stage) {
    const sparkleList = Array.from({ length: 14 }, (_, index) => ({
      id: `${stage}-${Date.now()}-${index}`,
      left: Math.random() * 90 + 5,
      delay: Math.random() * 0.4,
      duration: 1.2 + Math.random() * 0.8,
      rotate: -30 + Math.random() * 60,
      size: 8 + Math.random() * 14,
    }))
    setSparkles(sparkleList)
    setCelebrationStage(stage)
    playCelebrationMusic()

    confetti({
      particleCount: 140,
      spread: 120,
      startVelocity: 45,
      origin: { x: 0.5, y: 0.62 },
      colors: ['#ffd700', '#ffef8a', '#ffffff', '#ff7fd1', '#8b5cf6'],
      scalar: 1.15,
    })

    window.setTimeout(() => {
      confetti({
        particleCount: 90,
        spread: 90,
        startVelocity: 35,
        origin: { x: 0.2, y: 0.55 },
        colors: ['#ffd700', '#ffffff', '#ff7fd1'],
      })
      confetti({
        particleCount: 90,
        spread: 90,
        startVelocity: 35,
        origin: { x: 0.8, y: 0.55 },
        colors: ['#ffd700', '#ffffff', '#8b5cf6'],
      })
    }, 220)

    if (timerRef.current) window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => {
      setCelebrationStage(null)
      setSparkles([])
    }, 2800)
  }

  function addScore(field, label) {
    const points = Number(state[field]) || 0
    const nextScore = state.score + points
    const nextHistory = [`${label} +${points}`, ...state.history].slice(0, 20)
    let nextMessage = `${label} 成功，團隊加 ${points} 分！`
    let unlockedStage = null

    if (state.score < state.stage1Target && nextScore >= state.stage1Target) {
      nextMessage = '第一個寶箱出現了！快一起歡呼！'
      unlockedStage = 1
    }
    if (state.score < state.stage2Target && nextScore >= state.stage2Target) {
      nextMessage = '第二個寶箱解鎖！準備迎接最終驚喜！'
      unlockedStage = 2
    }

    update({ ...state, score: nextScore, history: nextHistory }, nextMessage)
    if (unlockedStage) triggerCelebration(unlockedStage)
  }

  function subtractRing() {
    const points = Number(state.ringPoints) || 0
    const nextScore = Math.max(0, state.score - points)
    const nextHistory = [`套圈圈更正 -${points}`, ...state.history].slice(0, 20)
    update({ ...state, score: nextScore, history: nextHistory }, `已更正套圈圈分數 -${points} 分。`)
  }

  function resetProgress() {
    const fresh = createFreshState()
    update(
      {
        ...fresh,
        eventTitle: state.eventTitle,
        eventSubtitle: state.eventSubtitle,
        stage1Target: state.stage1Target,
        stage2Target: state.stage2Target,
        ringPoints: state.ringPoints,
        balloon1Points: state.balloon1Points,
        balloon2Points: state.balloon2Points,
        balloon3Points: state.balloon3Points,
        stage1Reward: state.stage1Reward,
        stage2Reward: state.stage2Reward,
        goodbyeReward: state.goodbyeReward,
        notes: state.notes,
      },
      '分數已歸零，可以重新開始。',
    )
    setCelebrationStage(null)
    setSparkles([])
  }

  return (
    <>
      <div className="playLayout">
        <section className="panel energyPanel">
          <div className="pill" style={{ marginBottom: 10 }}>家庭合作闖關模式</div>
          <h1 style={{ margin: 0 }}>{state.eventTitle}</h1>
          <p style={{ opacity: 0.82, marginTop: 8 }}>{state.eventSubtitle}</p>

          <div className="scoreBadge">{state.score} 分</div>
          <div className="energyWrap">
            <VerticalEnergyBar
              score={state.score}
              totalPercent={totalPercent}
              stage1Target={state.stage1Target}
              stage2Target={state.stage2Target}
              stage1Open={stage1Open}
              stage2Open={stage2Open}
            />
          </div>

          <div className="messageCard">{message}</div>
          <div className="pill" style={{ marginTop: 10 }}>回家禮也準備好了，最後一起帶回家！</div>
        </section>

        <div style={{ display: 'grid', gap: 16 }}>
          <section className="panel">
            <h2 className="panelTitle">加分按鈕</h2>
            <div className="actionGrid">
              {ACTIONS.map((action) => (
                <button
                  key={action.key}
                  type="button"
                  className="btn btnPrimary actionButton"
                  onClick={() => addScore(action.field, action.label)}
                >
                  <span className="actionEmoji">{action.emoji}</span>
                  <span>{action.label}</span>
                  <span className="actionPoints">+{state[action.field]}</span>
                </button>
              ))}
              <button
                type="button"
                className="btn actionButton actionButtonSecondary"
                onClick={subtractRing}
              >
                <span className="actionEmoji">↩️</span>
                <span>套圈圈分數更正</span>
                <span className="actionPoints">-{state.ringPoints}</span>
              </button>
            </div>
          </section>

          <section className="panel">
            <h2 className="panelTitle">規則摘要</h2>
            <pre className="notesBox">{state.notes}</pre>
          </section>

          <section className="panel">
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="panelTitle" style={{ marginBottom: 0 }}>最近紀錄</h2>
              <button type="button" className="btn" onClick={resetProgress}>分數歸零</button>
            </div>
            <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
              {state.history.length === 0 ? <div style={{ opacity: 0.7 }}>目前還沒有加分紀錄。</div> : null}
              {state.history.map((item, index) => (
                <div key={`${item}-${index}`} className="pill" style={{ justifyContent: 'space-between' }}>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {celebrationStage ? (
        <div className="celebrationOverlay">
          <div className="celebrationGlow" />
          {sparkles.map((sparkle) => (
            <span
              key={sparkle.id}
              className="sparklePiece"
              style={{
                left: `${sparkle.left}%`,
                animationDelay: `${sparkle.delay}s`,
                animationDuration: `${sparkle.duration}s`,
                transform: `rotate(${sparkle.rotate}deg)`,
                width: `${sparkle.size}px`,
                height: `${sparkle.size * 2.4}px`,
              }}
            />
          ))}
          <div className="celebrationCard">
            <div className="celebrationTitle">
              {celebrationStage === 1 ? '第一寶箱解鎖！' : '第二寶箱解鎖！'}
            </div>
            <TreasureChest open />
            <div className="celebrationSub">金光閃閃！一起來打開寶箱吧！</div>
          </div>
        </div>
      ) : null}
    </>
  )
}

function VerticalEnergyBar({ score, totalPercent, stage1Target, stage2Target, stage1Open, stage2Open }) {
  return (
    <div className="energyBarScene">
      <div className="energyBarTrack">
        <div className="energyBarFill" style={{ height: `${totalPercent}%` }} />
        <EnergyMarker target={stage2Target} stageLabel="100" opened={stage2Open} percent={100} />
        <EnergyMarker target={stage1Target} stageLabel="50" opened={stage1Open} percent={(stage1Target / stage2Target) * 100} />
      </div>
    </div>
  )
}

function EnergyMarker({ target, stageLabel, opened, percent }) {
  return (
    <div className="energyMarker" style={{ bottom: `calc(${percent}% - 34px)` }}>
      <div className="markerLabel">{stageLabel} 分</div>
      <div className={`markerChest ${opened ? 'markerChestOpen' : ''}`}>
        <TreasureChest open={opened} compact />
      </div>
      <div className="markerHint">{opened ? '已解鎖' : `目標 ${target}`}</div>
    </div>
  )
}

function TreasureChest({ open = false, compact = false }) {
  return (
    <div className={`treasureChest ${open ? 'treasureChestOpen' : ''} ${compact ? 'treasureChestCompact' : ''}`}>
      <div className="treasureGlow" />
      <div className="treasureLid" />
      <div className="treasureBase" />
      <div className="treasureLock" />
      <div className="treasureLight treasureLight1" />
      <div className="treasureLight treasureLight2" />
      <div className="treasureLight treasureLight3" />
    </div>
  )
}
