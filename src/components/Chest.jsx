import './chest.css'

export default function Chest({ progress, glow, embedded = false, caption }) {
  const safe = Math.min(1, Math.max(0, Number(progress) || 0))
  const wrapClass = `chestWrap${glow ? ' chestGlow' : ''}${embedded ? ' chestWrapEmbedded' : ''}`

  const percent = `${(safe * 100).toFixed(2)}%`
  const imgSrc = `${import.meta.env.BASE_URL}process-chest.png`

  return (
    <div className={wrapClass}>
      <div className="chestProgress" role="img" aria-label="寶箱進度" style={{ '--percent': percent }}>
        <img className="chestImg chestImgGray" src={imgSrc} alt="" aria-hidden="true" draggable="false" />
        <img className="chestImg chestImgColor" src={imgSrc} alt="" aria-hidden="true" draggable="false" />
      </div>
    </div>
  )
}

