import './hintBox.css'

export default function HintBox({ title, text }) {
  return (
    <div className="hintBox" role="status" aria-live="polite">
      <div className="hintTitle">{title}</div>
      <div className="hintText">{text || '再試一次～'}</div>
    </div>
  )
}
