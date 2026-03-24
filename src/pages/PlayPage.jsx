import { useEffect, useMemo, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import { createFreshState, loadState, saveState } from '../lib/storage.js'

export default function PlayPage() {
  const [state, setState] = useState(() => loadState())
  const [message, setMessage] = useState('準備好了就開始累積分數吧！')
  const audioRef = useRef(null)

  const stage1Open = state.score >= state.stage1Target

  function update(next, msg) {
    saveState(next)
    setState(next)
    if (msg) setMessage(msg)
  }

  // ✅ 已加入防呆邏輯
  function addScore(field, label) {
    const points = Number(state[field]) || 0
    const isRingAction = field === 'ringPoints'

    // 🚫 防呆 1：50 分前不能按氣球
    if (!isRingAction && state.score < state.stage1Target) {
      setMessage('套圈圈關還沒闖關成功喔，請前往套圈圈關')
      return
    }

    // 🚫 防呆 2：50 分後不能再加套圈圈
    if (isRingAction && state.score >= state.stage1Target) {
      setMessage(`套圈圈關已達 ${state.stage1Target} 分，請前往氣球關`)
      return
    }

    const cap = isRingAction ? state.stage1Target : state.stage2Target

    if (state.score >= cap) return

    const nextScore = Math.min(cap, state.score + points)
    const actualGain = nextScore - state.score

    const nextHistory = [`${label} +${actualGain}`, ...state.history].slice(0, 16)

    let nextMessage = `${label} 成功，團隊加 ${actualGain} 分！`

    update(
      { ...state, score: nextScore, history: nextHistory },
      nextMessage
    )
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>{state.score} 分</h1>
      <p>{message}</p>

      <div style={{ display: 'flex', gap: 40 }}>

        {/* 左：套圈圈 */}
        <div>
          <h3>套圈圈</h3>
          <button onClick={() => addScore('ringPoints', '套圈圈1次 +3')}>+3</button><br/>
          <button onClick={() => addScore('ringPoints', '套圈圈2次 +6')}>+6</button><br/>
          <button onClick={() => addScore('ringPoints', '套圈圈3次 +9')}>+9</button>
        </div>

        {/* 右：氣球 */}
        <div>
          <h3>氣球</h3>
          <button onClick={() => addScore('balloon1Points', '1顆氣球 +10')}>+10</button><br/>
          <button onClick={() => addScore('balloon2Points', '3顆氣球 +15')}>+15</button><br/>
          <button onClick={() => addScore('balloon3Points', '4顆氣球 +25')}>+25</button>
        </div>

      </div>
    </div>
  )
}
