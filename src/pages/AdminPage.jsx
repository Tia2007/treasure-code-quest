import { useState } from 'react'
import { loadState, saveState } from '../lib/storage.js'

export default function AdminPage() {
  const [state, setState] = useState(() => loadState())
  const [saved, setSaved] = useState(false)

  function updateField(field, value) {
    setSaved(false)
    setState((prev) => ({ ...prev, [field]: value }))
  }

  function saveAll() {
    saveState(state)
    setSaved(true)
  }

  function clearScore() {
    const next = { ...state, score: 0, history: [] }
    setState(next)
    saveState(next)
    setSaved(true)
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <section className="panel">
        <h2 className="panelTitle">活動內容設定</h2>
        <Field label="活動標題">
          <input className="input" value={state.eventTitle} onChange={(e) => updateField('eventTitle', e.target.value)} />
        </Field>
        <Field label="活動副標">
          <input className="input" value={state.eventSubtitle} onChange={(e) => updateField('eventSubtitle', e.target.value)} />
        </Field>
        <div className="row" style={{ gap: 12 }}>
          <Field label="第一寶箱目標分數">
            <input className="input" type="number" value={state.stage1Target} onChange={(e) => updateField('stage1Target', Number(e.target.value))} />
          </Field>
          <Field label="第二寶箱目標分數">
            <input className="input" type="number" value={state.stage2Target} onChange={(e) => updateField('stage2Target', Number(e.target.value))} />
          </Field>
        </div>
        <div className="row" style={{ gap: 12 }}>
          <Field label="套圈圈每次命中分數">
            <input className="input" type="number" value={state.ringPoints} onChange={(e) => updateField('ringPoints', Number(e.target.value))} />
          </Field>
          <Field label="1 顆氣球過關分數">
            <input className="input" type="number" value={state.balloon1Points} onChange={(e) => updateField('balloon1Points', Number(e.target.value))} />
          </Field>
        </div>
        <div className="row" style={{ gap: 12 }}>
          <Field label="2 顆氣球過關分數">
            <input className="input" type="number" value={state.balloon2Points} onChange={(e) => updateField('balloon2Points', Number(e.target.value))} />
          </Field>
          <Field label="3 顆氣球過關分數">
            <input className="input" type="number" value={state.balloon3Points} onChange={(e) => updateField('balloon3Points', Number(e.target.value))} />
          </Field>
        </div>
      </section>

      <section className="panel">
        <h2 className="panelTitle">獎勵文字</h2>
        <Field label="第一寶箱">
          <input className="input" value={state.stage1Reward} onChange={(e) => updateField('stage1Reward', e.target.value)} />
        </Field>
        <Field label="第二寶箱">
          <input className="input" value={state.stage2Reward} onChange={(e) => updateField('stage2Reward', e.target.value)} />
        </Field>
        <Field label="回家禮">
          <input className="input" value={state.goodbyeReward} onChange={(e) => updateField('goodbyeReward', e.target.value)} />
        </Field>
        <Field label="規則說明">
          <textarea className="input" rows="5" value={state.notes} onChange={(e) => updateField('notes', e.target.value)} />
        </Field>
      </section>

      <section className="panel">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div>
            <h2 className="panelTitle" style={{ marginBottom: 4 }}>目前分數：{state.score}</h2>
            <div style={{ opacity: 0.75 }}>這個管理頁沒有 PIN，活動前請先設定好，現場不要讓孩子切到這頁。</div>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <button type="button" className="btn" onClick={clearScore}>清空分數</button>
            <button type="button" className="btn btnPrimary" onClick={saveAll}>儲存設定</button>
          </div>
        </div>
        {saved ? <div style={{ marginTop: 12 }} className="pill">已儲存到這台裝置。</div> : null}
      </section>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div style={{ display: 'grid', gap: 8, flex: 1 }}>
      <div className="fieldLabel">{label}</div>
      {children}
    </div>
  )
}
