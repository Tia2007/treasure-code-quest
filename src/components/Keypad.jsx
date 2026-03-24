import './keypad.css'

export default function Keypad({
  disabled,
  valueLength,
  onDigit,
  onBackspace,
  onClear,
  onSubmit,
}) {
  const submitDisabled = disabled || valueLength !== 3

  return (
    <div className="keypad" aria-label="數字鍵盤">
      <div className="keyGrid">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <button
            key={n}
            type="button"
            className="keyButton"
            onClick={() => onDigit(String(n))}
            disabled={disabled}
          >
            {n}
          </button>
        ))}

        <button
          type="button"
          className="keyButton keyButtonAlt"
          onClick={onClear}
          disabled={disabled}
        >
          清除
        </button>

        <button
          type="button"
          className="keyButton"
          onClick={() => onDigit('0')}
          disabled={disabled}
        >
          0
        </button>

        <button
          type="button"
          className="keyButton keyButtonAlt"
          onClick={onBackspace}
          disabled={disabled}
        >
          退格
        </button>
      </div>

      <button
        type="button"
        className="keySubmit"
        onClick={onSubmit}
        disabled={submitDisabled}
      >
        送出
      </button>
    </div>
  )
}
