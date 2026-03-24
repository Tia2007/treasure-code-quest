import './rewardCard.css'

export default function RewardCard({ embedded = false } = {}) {
  const imgSrc = `${import.meta.env.BASE_URL}reward-card-art.png`

  const inner = (
    <>
      <div className="rewardTitle">寶藏兌換卡</div>
      <div className="rewardArtWrap">
        <img className="rewardArt" src={imgSrc} alt="兌換卡圖片" />
      </div>
    </>
  )

  if (embedded) {
    return (
      <div className="rewardInner" aria-label="寶藏兌換卡">
        {inner}
      </div>
    )
  }

  return (
    <div className="rewardCard" aria-label="寶藏兌換卡">
      <div className="rewardInner">
        {inner}
      </div>
    </div>
  )
}

