import { useEffect, useMemo, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import { createFreshState, loadState, saveState } from '../lib/storage.js'

const ACTIONS = [
  { key: 'ring1', label: '套圈圈 1 次', points: 3, emoji: '⭕' },
  { key: 'balloon1', label: '氣球 1 顆', points: 10, emoji: '🎈' },
  { key: 'ring2', label: '套圈圈 2 次', points: 6, emoji: '⭕⭕' },
  { key: 'balloon3', label: '氣球 3 顆', points: 15, emoji: '🎈🎈🎈' },
  { key: 'ring3', label: '套圈圈 3 次', points: 9, emoji: '⭕⭕⭕' },
  { key: 'balloon4', label: '氣球 4 顆', points: 25, emoji: '🎈🎈🎈🎈' },
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

  function playCelebrationMusic(stage) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return

    if (!audioRef.current || audioRef.current.state === 'closed') {
      audioRef.current = new AudioCtx()
    }

    const ctx = audioRef.current
    if (ctx.state === 'suspended') ctx.resume().catch(() => {})

    const now = ctx.currentTime
    const melody = stage === 1
      ? [659.25, 783.99, 1046.5, 1318.51, 1567.98, 1318.51, 1760, 1567.98, 2093]
      : [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98, 1760, 2093, 2349.32, 2093, 2637.02]

    const chords = stage === 1
      ? [[261.63, 329.63, 392], [293.66, 369.99, 440], [329.63, 415.3, 493.88], [392, 493.88, 587.33], [440, 554.37, 659.25]]
      : [[261.63, 329.63, 392], [329.63, 415.3, 493.88], [392, 493.88, 587.33], [523.25, 659.25, 783.99], [659.25, 783.99, 987.77]]

    melody.forEach((freq, index) => {
      const start = now + index * 0.15
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = index % 2 === 0 ? 'triangle' : 'sawtooth'
      osc.frequency.setValueAtTime(freq, start)
      gain.gain.setValueAtTime(0.0001, start)
      gain.gain.linearRampToValueAtTime(0.19, start + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.34)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(start)
      osc.stop(start + 0.36)
    })

    chords.forEach((chord, chordIndex) => {
      const start = now + chordIndex * 0.3
      chord.forEach((freq, noteIndex) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = noteIndex === 1 ? 'square' : 'sine'
        osc.frequency.setValueAtTime(freq, start)
        gain.gain.setValueAtTime(0.0001, start)
        gain.gain.linearRampToValueAtTime(0.075, start + 0.03)
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.58)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(start)
        osc.stop(start + 0.62)
      })
    })

    ;[0, 0.16, 0.32, 0.48, 0.64, 0.8, 0.96, 1.12].forEach((offset, index) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'square'
      osc.frequency.setValueAtTime(index % 2 === 0 ? 110 : 98, now + offset)
      gain.gain.setValueAtTime(0.0001, now + offset)
      gain.gain.linearRampToValueAtTime(0.13, now + offset + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.16)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now + offset)
      osc.stop(now + offset + 0.18)
    })

    ;[0.24, 0.48, 0.72, 0.96, 1.2, 1.44].forEach((offset, index) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(index % 2 === 0 ? 1760 : 2093, now + offset)
      gain.gain.setValueAtTime(0.0001, now + offset)
      gain.gain.linearRampToValueAtTime(0.145, now + offset + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.26)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now + offset)
      osc.stop(now + offset + 0.28)
    })

    const whoosh = ctx.createOscillator()
    const whooshGain = ctx.createGain()
    whoosh.type = 'sawtooth'
    whoosh.frequency.setValueAtTime(420, now)
    whoosh.frequency.exponentialRampToValueAtTime(1380, now + 0.24)
    whooshGain.gain.setValueAtTime(0.0001, now)
    whooshGain.gain.linearRampToValueAtTime(0.09, now + 0.04)
    whooshGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42)
    whoosh.connect(whooshGain)
    whooshGain.connect(ctx.destination)
    whoosh.start(now)
    whoosh.stop(now + 0.44)
  }

  function triggerCelebration(stage) {
    const sparkleList = Array.from({ length: 34 }, (_, index) => ({
      id: `${stage}-${Date.now()}-${index}`,
      left: Math.random() * 90 + 5,
      delay: Math.random() * 0.5,
      duration: 1.6 + Math.random() * 1.2,
      rotate: -70 + Math.random() * 140,
      size: 10 + Math.random() * 22,
      hue: ['#ffd700', '#fff2a8', '#ff7fd1', '#8b5cf6', '#7ce7ff', '#7dffb7'][index % 6],
    }))
    setSparkles(sparkleList)
    setCelebrationStage(stage)
    playCelebrationMusic(stage)

    confetti({
      particleCount: 220,
      spread: 130,
      startVelocity: 58,
      gravity: 0.78,
      origin: { x: 0.5, y: 0.64 },
      colors: ['#ffd700', '#ffef8a', '#ffffff', '#ff7fd1', '#8b5cf6', '#7ce7ff', '#7dffb7'],
      scalar: 1.4,
    })

    window.setTimeout(() => {
      confetti({ particleCount: 160, spread: 90, startVelocity: 48, origin: { x: 0.15, y: 0.6 }, colors: ['#ffd700', '#ff7fd1', '#ffffff'] })
      confetti({ particleCount: 160, spread: 90, startVelocity: 48, origin: { x: 0.85, y: 0.6 }, colors: ['#ffd700', '#7ce7ff', '#ffffff'] })
      confetti({ particleCount: 120, spread: 70, startVelocity: 34, origin: { x: 0.5, y: 0.45 }, colors: ['#fff2a8', '#ffffff'] })
    }, 280)

    if (timerRef.current) window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => {
      setCelebrationStage(null)
      setSparkles([])
    }, 3600)
  }

  const playBeep = (type = 'ok') => {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
  
    if (!audioRef.current || audioRef.current.state === 'closed') {
      audioRef.current = new AudioCtx()
    }
  
    const ctx = audioRef.current
    if (ctx.state === 'suspended') ctx.resume()
  
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
  
    if (type === 'error') {
      osc.type = 'sine'
      osc.frequency.setValueAtTime(440, now)
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.25)
    } else {
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(880, now)
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.2)
    }
  
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.linearRampToValueAtTime(0.15, now + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25)
  
    osc.connect(gain)
    gain.connect(ctx.destination)
  
    osc.start(now)
    osc.stop(now + 0.25)
  }
  
  function addScore(points, label, type) {
    // 🚫 防呆：50分前不能按氣球
    if (type !== 'ring' && state.score < state.stage1Target) {
      setMessage('套圈圈關還沒闖關成功喔，請前往套圈圈關')
      playBeep('error')
      return
    }
  
    // 🚫 防呆：50分後不能再按套圈圈
    if (type === 'ring' && state.score >= state.stage1Target) {
      setMessage(`套圈圈關已達 ${state.stage1Target} 分，請前往氣球關`)
      playBeep('error')
      return
    }
  
    const cap = type === 'ring' ? state.stage1Target : state.stage2Target
  
    if (state.score >= cap) {
      const lockedMessage = type === 'ring'
        ? `套圈圈關已達 ${state.stage1Target} 分，請前往氣球關！`
        : `總分已達 ${state.stage2Target} 分，準備開寶箱！`
      setMessage(lockedMessage)
      playBeep('error')
      return
    }
  
    const nextScore = Math.min(cap, state.score + points)
    const actualGain = nextScore - state.score
    const nextHistory = [`${label} +${actualGain}`, ...state.history].slice(0, 16)
  
    let nextMessage = `${label} 成功，團隊加 ${actualGain} 分！`
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
    playBeep('ok')
  
    if (unlockedStage) triggerCelebration(unlockedStage)
  }

  function subtractRing() {
    const points = 3
    const nextScore = Math.max(0, state.score - points)
    const nextHistory = [`套圈圈更正 -${points}`, ...state.history].slice(0, 16)
    update({ ...state, score: nextScore, history: nextHistory }, `已更正套圈圈分數 -${points} 分。`)
  }

  function subtractBalloon() {
    const points = 5
    const nextScore = Math.max(0, state.score - points)
    const nextHistory = [`氣球不落地更正 -${points}`, ...state.history].slice(0, 16)
    update({ ...state, score: nextScore, history: nextHistory }, `已更正氣球不落地分數 -${points} 分。`)
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
      <div className="playLayout playLayoutWide playLayoutHost">
        <section className="panel energyPanel energyPanelHorizontal energyPanelHost">
          <div className="energyPanelHeader">
            <div className="pill">家庭合作闖關模式</div>
            <div className="hostHint">iPad 主持畫面：大按鈕、橫向滿版、免捲動</div>
          </div>
          <h1 className="hostTitle">{state.eventTitle}</h1>
          <p className="hostSubtitle">{state.eventSubtitle}</p>

          <div className="scoreBadge">{state.score} 分</div>
          <div className="energyWrap energyWrapHorizontal energyWrapHost">
            <HorizontalEnergyBar
              score={state.score}
              totalPercent={totalPercent}
              stage1Target={state.stage1Target}
              stage2Target={state.stage2Target}
              stage1Open={stage1Open}
              stage2Open={stage2Open}
            />
          </div>

          <div className="messageCard messageCardHost">{message}</div>
          <div className="pill pillGoodbye">回家禮也準備好了，最後一起帶回家！</div>
        </section>

        <section className="rightStageColumn">
          <section className="panel panelCompact">
            <div className="panelHeaderCompact">
              <h2 className="panelTitle">加分按鈕</h2>
              <button type="button" className="btn btnResetInline" onClick={resetProgress}>分數歸零</button>
            </div>
            <div className="actionGrid actionGridHost">
              {ACTIONS.map((action) => (
                <button
                  key={action.key}
                  type="button"
                  className="btn btnPrimary actionButton actionButtonHost"
                  onClick={() => addScore(action.points, action.label, action.key.startsWith('ring') ? 'ring' : 'balloon')}
                >
                  <span className="actionEmoji">{action.emoji}</span>
                  <span>{action.label}</span>
                  <span className="actionPoints">+{action.points}</span>
                </button>
              ))}
              <button
                type="button"
                className="btn actionButton actionButtonSecondary actionButtonHost"
                onClick={subtractRing}
              >
                <span className="actionEmoji">↩️</span>
                <span>套圈圈分數更正</span>
                <span className="actionPoints">-3</span>
              </button>
              <button
                type="button"
                className="btn actionButton actionButtonSecondary actionButtonHost"
                onClick={subtractBalloon}
              >
                <span className="actionEmoji">↩️</span>
                <span>氣球分數更正</span>
                <span className="actionPoints">-5</span>
              </button>
            </div>
          </section>

          <div className="hostBottomGrid">
            <section className="panel panelCompact hostMiniPanel">
              <h2 className="panelTitle">規則摘要</h2>
              <pre className="notesBox notesBoxCompact">{state.notes}</pre>
            </section>

            <section className="panel panelCompact hostMiniPanel">
              <h2 className="panelTitle">最近紀錄</h2>
              <div className="historyCompactList">
                {state.history.length === 0 ? <div className="historyEmpty">目前還沒有加分紀錄。</div> : null}
                {state.history.map((item, index) => (
                  <div key={`${item}-${index}`} className="pill historyPill">
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </section>
      </div>

      {celebrationStage ? (
        <div className="celebrationOverlay">
          <div className="celebrationGlow" />
          <div className="celebrationBurst celebrationBurstLeft" />
          <div className="celebrationBurst celebrationBurstRight" />
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
                height: `${sparkle.size * 2.8}px`,
                background: `linear-gradient(180deg, #fffef9 0%, ${sparkle.hue} 100%)`,
              }}
            />
          ))}
          <div className="celebrationCard celebrationCardEpic">
            <div className="celebrationTitle">{celebrationStage === 1 ? '第一寶箱解鎖！' : '第二寶箱解鎖！'}</div>
            <div className="celebrationSub celebrationSubTop">快看！寶箱放大登場！</div>
            <TreasureChest open giant epic />
            <div className="celebrationSub">金光、彩帶、歡呼聲一起登場！</div>
          </div>
        </div>
      ) : null}
    </>
  )
}

function HorizontalEnergyBar({ totalPercent, stage1Target, stage2Target, stage1Open, stage2Open }) {
  return (
    <div className="energyBarSceneHorizontal energyBarSceneHost">
      <div className="energyBarTrackHorizontal energyBarTrackHost">
        <div className="energyBarFillHorizontal energyBarFillHost" style={{ width: `${totalPercent}%` }} />
        <EnergyChestMarker target={stage1Target} stageLabel="50" opened={stage1Open} percent={(stage1Target / stage2Target) * 100} />
        <EnergyChestMarker target={stage2Target} stageLabel="100" opened={stage2Open} percent={100} />
      </div>
    </div>
  )
}

function EnergyChestMarker({ target, stageLabel, opened, percent }) {
  const clampedLeft = percent === 100 ? 'calc(100% - 70px)' : `calc(${percent}% - 70px)`
  return (
    <div className="energyMarkerHorizontal energyMarkerHost" style={{ left: clampedLeft }}>
      <div className="markerLabel markerLabelTop">{stageLabel} 分</div>
      <div className={`markerChest markerChestFancy markerChestHost ${opened ? 'markerChestOpen' : ''}`}>
        <TreasureChest open={opened} compact epic />
      </div>
      <div className="markerHint">{opened ? '已解鎖' : `目標 ${target}`}</div>
    </div>
  )
}

function TreasureChest({ open = false, compact = false, giant = false, epic = false }) {
  return (
    <div className={`treasureChest ${open ? 'treasureChestOpen' : ''} ${compact ? 'treasureChestCompact' : ''} ${giant ? 'treasureChestGiant' : ''} ${epic ? 'treasureChestEpic' : ''}`}>
      <div className="treasureAura" />
      <div className="treasureGlow" />
      <div className="treasureGem treasureGemLeft" />
      <div className="treasureGem treasureGemRight" />
      <div className="treasureGem treasureGemCenter" />
      <div className="treasureLid">
        <div className="treasureBand treasureBandTop" />
        <div className="treasureRim" />
        <div className="treasureCrown" />
      </div>
      <div className="treasureBase">
        <div className="treasureBand treasureBandMid" />
        <div className="treasureBand treasureBandBottom" />
      </div>
      <div className="treasureLock" />
      <div className="treasureStud treasureStud1" />
      <div className="treasureStud treasureStud2" />
      <div className="treasureStud treasureStud3" />
      <div className="treasureStud treasureStud4" />
      <div className="treasureLight treasureLight1" />
      <div className="treasureLight treasureLight2" />
      <div className="treasureLight treasureLight3" />
      <div className="treasureLight treasureLight4" />
      <div className="treasureRibbon treasureRibbonLeft" />
      <div className="treasureRibbon treasureRibbonRight" />
    </div>
  )
}
