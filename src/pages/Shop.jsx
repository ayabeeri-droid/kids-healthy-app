function Shop({ gameState, notifications }) {
  const { state, buyReward, getEffectiveRewards } = gameState
  const REWARDS = getEffectiveRewards()
  const { showModal, showToast, spawnConfetti } = notifications

  function handleBuyReward(reward) {
    const canAfford = state.coins >= reward.cost
    if (!canAfford) {
      showToast('😅 אין מספיק מטבעות! המשך לצבור!')
      return
    }
    if (window.confirm(`להמיר 🪙${reward.cost} בשביל "${reward.name}"?`)) {
      buyReward(reward)
      spawnConfetti()
      showModal(
        '🎉',
        'מצוין!',
        `המרת ${reward.emoji} "${reward.name}"!\nתראה/י את ההורים לאישור!`,
      )
    }
  }

  return (
    <>
      {/* Header */}
      <div className="header" style={{ paddingBottom: 24 }}>
        <div
          style={{
            fontFamily: "'Fredoka One', cursive",
            fontSize: 24,
            color: 'white',
            marginBottom: 4,
          }}
        >
          🎁 חנות הגיבורים
        </div>
        <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>
          המר מטבעות בצ'ופרים מגניבים
        </div>
        <div className="coin-bar" style={{ marginTop: 14 }}>
          <div className="coin-icon">🪙</div>
          <div className="coin-info">
            <div className="coin-count">{state.coins}</div>
            <div className="coin-label">מטבעות זמינים</div>
          </div>
        </div>
      </div>

      {/* Rewards grid */}
      <div className="section">
        <div className="rewards-grid">
          {REWARDS.map(reward => {
            const canAfford = state.coins >= reward.cost
            return (
              <div
                key={reward.id}
                className={`reward-card${canAfford ? ' affordable' : ''}`}
                onClick={() => handleBuyReward(reward)}
              >
                <span className="reward-emoji">{reward.emoji}</span>
                <div className="reward-name">{reward.name}</div>
                <div className={`reward-cost${canAfford ? '' : ' cant'}`}>
                  🪙 {reward.cost}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ height: 20 }} />
    </>
  )
}

export default Shop
