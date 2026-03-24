import { useMemo, useState } from 'react'
import { createFreshState, loadState, saveState } from '../lib/storage.js'

const ACTIONS = [
  { key: 'ring', label: '套圈圈套中 1 次', field: 'ringPoints' },
  { key: 'balloon1', label: '1 顆氣球 30 秒成功', field: 'balloon1Points' },
  { key: 'balloon2', label: '2 顆氣球 30 秒成功', field: 'balloon2Points' },
  { key: 'balloon3', label: '3 顆氣球 30 秒成功', field: 'balloon3Points' },
]

export default function PlayPage() {
  const [state, setState] = useState(() => loadState())
  const [message, setMessage] = useState('準備好了就開始累積分數吧！')

  const stage1Open = state.score >= state.stage1Target
  const stage2Open = state.score >= state.stage2Target

  const stage1Percent = useMemo(
    () => Math.min(100, Math.round((state.score / state.stage1Target) * 100)),
    [state.score, state.stage1Target],
  )
  const stage2Percent = useMemo(
    () => Math.min(100, Math.round((state.score / state.stage2Target) * 100)),
    [state.score, state.stage2Target],
  )

  function update(next, nextMessage = message) {
    saveState(next)
    setState(next)
    setMessage(nextMessage)
  }

  function addScore(field, label) {
    const points = Number(state[field]) || 0
    const nextScore = state.score + points
    const nextHistory = [`${label} +${points}`, ...state.history].slice(0, 20)
    let nextMessage = `${label} 成功，團隊加 ${points} 分！`

    if (state.score < state.stage1Target && nextScore >= state.stage1Target) {
      nextMessage = `恭喜解鎖第一寶箱！${state.stage1Reward}`
    } else if (state.score < state.stage2Target && nextScore >= state.stage2Target) {
      nextMessage = `恭喜解鎖第二寶箱！${state.stage2Reward}`
    }

    update({ ...state, score: nextScore, history: nextHistory }, nextMessage)
  }

  function subtractRing() {
    const points = Number(state.ringPoints) || 0
    const nextScore = Math.max(0, state.score - points)
    const nextHistory = [`套圈圈更正 -${points}`, ...state.history].slice(0, 20)
    update({ ...state, score: nextScore, history: nextHistory }, `已更正套圈圈分數 -${points} 分。`)
  }

  function resetProgress() {
    const fresh = createFreshState()
    update({ ...fresh, eventTitle: state.eventTitle, eventSubtitle: state.eventSubtitle, stage1Target: state.stage1Target, stage2Target: state.stage2Target, ringPoints: state.ringPoints, balloon1Points: state.balloon1Points, balloon2Points: state.balloon2Points, balloon3Points: state.balloon3Points, stage1Reward: state.stage1Reward, stage2Reward: state.stage2Reward, goodbyeReward: state.goodbyeReward, notes: state.notes }, '分數已歸零，可以重新開始。')
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <section className="panel" style={{ textAlign: 'center' }}>
        <div className="pill" style={{ marginBottom: 12 }}>家庭合作闖關模式</div>
        <h1 style={{ margin: 0 }}>{state.eventTitle}</h1>
        <p style={{ opacity: 0.85 }}>{state.eventSubtitle}</p>
        <div style={{ fontSize: 56, fontWeight: 800, lineHeight: 1, margin: '16px 0 8px' }}>{state.score}</div>
        <div style={{ fontSize: 18, opacity: 0.8 }}>目前總分</div>
        <div style={{ marginTop: 14, fontWeight: 700 }}>{message}</div>
      </section>

      <section className="panel">
        <h2 className="panelTitle">寶箱進度</h2>
        <ProgressRow label={`第一寶箱 ${state.stage1Reward}`} percent={stage1Percent} current={state.score} target={state.stage1Target} open={stage1Open} />
        <div style={{ height: 12 }} />
        <ProgressRow label={`第二寶箱 ${state.stage2Reward}`} percent={stage2Percent} current={state.score} target={state.stage2Target} open={stage2Open} />
        <div style={{ height: 12 }} />
        <div className="pill" style={{ background: '#fff8db' }}>最後回家禮：{state.goodbyeReward}</div>
      </section>

      <section className="panel">
        <h2 className="panelTitle">加分按鈕</h2>
        <div style={{ display: 'grid', gap: 12 }}>
          {ACTIONS.map((action) => (
            <button
              key={action.key}
              type="button"
              className="btn btnPrimary"
              onClick={() => addScore(action.field, action.label)}
              style={{ width: '100%', justifyContent: 'space-between' }}
            >
              <span>{action.label}</span>
              <span>+{state[action.field]}</span>
            </button>
          ))}
          <button
            type="button"
            className="btn"
            onClick={subtractRing}
            style={{ width: '100%', borderStyle: 'dashed' }}
          >
            套圈圈分數更正 -{state.ringPoints}
          </button>
        </div>
      </section>

      <section className="panel">
        <h2 className="panelTitle">規則摘要</h2>
        <pre
          style={{
            margin: 0,
            whiteSpace: 'pre-wrap',
            fontFamily: 'inherit',
            lineHeight: 1.7,
            background: '#fffaf0',
            padding: 12,
            borderRadius: 16,
          }}
        >
          {state.notes}
        </pre>
      </section>

      <section className="panel">
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="panelTitle" style={{ marginBottom: 0 }}>最近紀錄</h2>
          <button type="button" className="btn" onClick={resetProgress}>分數歸零</button>
        </div>
        <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
          {state.history.length === 0 ? <div style={{ opacity: 0.7 }}>目前還沒有加分紀錄。</div> : null}
          {state.history.map((item, index) => (
            <div key={`${item}-${index}`} className="pill">{item}</div>
          ))}
        </div>
      </section>
    </div>
  )
}

function ProgressRow({ label, percent, current, target, open }) {
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <strong>{label}</strong>
        <span>{open ? '已解鎖' : `${current}/${target} 分`}</span>
      </div>
      <div style={{ height: 16, background: '#efe7ff', borderRadius: 999, overflow: 'hidden' }}>
        <div
          style={{
            width: `${percent}%`,
            height: '100%',
            background: open ? 'linear-gradient(90deg, #34d399, #10b981)' : 'linear-gradient(90deg, #8b5cf6, #ec4899)',
            transition: 'width 300ms ease',
          }}
        />
      </div>
    </div>
  )
}
