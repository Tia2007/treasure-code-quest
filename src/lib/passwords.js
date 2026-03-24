export function generateUnique3DigitCodes(count) {
  const safeCount = Number(count)

  if (!Number.isFinite(safeCount) || safeCount < 1) {
    return []
  }

  if (safeCount > 1000) {
    throw new Error('Too many kids: max unique 3-digit codes is 1000')
  }

  const numbers = Array.from({ length: 1000 }, (_, index) => index)

  for (let index = numbers.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    const temp = numbers[index]
    numbers[index] = numbers[swapIndex]
    numbers[swapIndex] = temp
  }

  return numbers
    .slice(0, safeCount)
    .map((n) => String(n).padStart(3, '0'))
}

export function isThreeDigitCode(value) {
  return typeof value === 'string' && /^[0-9]{3}$/.test(value)
}
