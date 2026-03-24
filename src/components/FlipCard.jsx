import './flipCard.css'

export default function FlipCard({
  isFlipped,
  onFlip,
  disabled,
  front,
  back,
  className = '',
  style,
  ariaLabel = '翻牌',
}) {
  const isLocked = Boolean(disabled)

  return (
    <button
      type="button"
      className={`flipCard${isFlipped ? ' flipCardFlipped' : ''}${isLocked ? ' flipCardDisabled' : ''}${className ? ` ${className}` : ''}`}
      onClick={isLocked ? undefined : onFlip}
      aria-label={ariaLabel}
      aria-disabled={isLocked}
      style={style}
    >
      <span className="flipCardInner">
        <span className="flipCardFace flipCardFront">{front}</span>
        <span className="flipCardFace flipCardBack">{back}</span>
      </span>
    </button>
  )
}
