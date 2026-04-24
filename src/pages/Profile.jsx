import { useState, useEffect, useMemo } from 'react'
import { TASKS, REWARDS } from '../hooks/useGameState'

const AVATARS = ['😎', '🦸', '🐱', '🦊', '🐸', '🦄', '🐼', '🤖']

function Profile({ gameState, notifications }) {
  const {
    state, level, goalSettings, rewardSettings, parentPin,
    saveProfile, saveGoalSettings, saveRewardSettings, changeParentPin, resetDay, resetAll,
    saveCustomReward, deleteCustomReward, getEffectiveRewards,
  } = gameState
  const { showToast } = notifications

  // Profile form
  const [nameInput,      setNameInput]      = useState(state.name || '')
  const [selectedAvatar, setSelectedAvatar] = useState(state.avatar || '😎')

  // Sync when state changes externally (e.g. after resetAll)
  useEffect(() => {
    setNameInput(state.name || '')
    setSelectedAvatar(state.avatar || '😎')
  }, [state.name, state.avatar])

  // Parent zone
  const [parentUnlocked, setParentUnlocked] = useState(false)
  const [pinBuffer,      setPinBuffer]      = useState('')
  const [pinError,       setPinError]       = useState('')
  const [adminGoals,     setAdminGoals]     = useState({})
  const [adminRewards,   setAdminRewards]   = useState({})
  const [newPin,         setNewPin]         = useState('')
  const [newRewardName,  setNewRewardName]  = useState('')
  const [newRewardEmoji, setNewRewardEmoji] = useState('🎁')
  const [newRewardCost,  setNewRewardCost]  = useState(50)

  // ── Profile ────────────────────────────────────────────────────────────────

  function handleSaveProfile() {
    saveProfile(nameInput.trim() || 'גיבור', selectedAvatar)
    showToast('✅ הפרופיל עודכן!')
  }

  // ── PIN pad ────────────────────────────────────────────────────────────────

  function pinPress(digit) {
    if (pinBuffer.length >= 4) return
    const next = pinBuffer + digit
    setPinBuffer(next)
    if (next.length === 4) {
      setTimeout(() => {
        if (next === parentPin) {
          openParent()
        } else {
          setPinError('❌ סיסמה שגויה, נסה שוב')
          setPinBuffer('')
          setTimeout(() => setPinError(''), 1500)
        }
      }, 120)
    }
  }

  function pinBack()  { setPinBuffer(p => p.slice(0, -1)); setPinError('') }
  function pinClear() { setPinBuffer(''); setPinError('') }

  // ── Parent zone ────────────────────────────────────────────────────────────

  function openParent() {
    // Clone current goalSettings so edits don't mutate state
    const init = {}
    TASKS.forEach(t => {
      const cfg = goalSettings[t.id] || { enabled: true, coins: t.coins }
      init[t.id] = { ...cfg }
    })
    setAdminGoals(init)

    // Clone current rewardSettings
    const initR = {}
    REWARDS.forEach(r => {
      const cfg = rewardSettings[r.id] || { enabled: true, name: r.name, cost: r.cost }
      initR[r.id] = { ...cfg }
    })
    setAdminRewards(initR)

    setParentUnlocked(true)
    setPinBuffer('')
  }

  function lockParent() {
    handleSaveGoals()
    handleSaveRewards()
    setParentUnlocked(false)
    showToast('🔒 אזור ההורים ננעל')
  }

  function handleToggleGoal(id) {
    setAdminGoals(prev => ({
      ...prev,
      [id]: { ...prev[id], enabled: !(prev[id]?.enabled ?? true) },
    }))
  }

  function handleGoalCoins(id, val) {
    setAdminGoals(prev => ({
      ...prev,
      [id]: { ...prev[id], coins: Math.max(1, parseInt(val) || 1) },
    }))
  }

  function handleSaveGoals() {
    saveGoalSettings(adminGoals)
    showToast('✅ היעדים נשמרו!')
  }

  function handleToggleReward(id) {
    setAdminRewards(prev => ({
      ...prev,
      [id]: { ...prev[id], enabled: !(prev[id]?.enabled ?? true) },
    }))
  }

  function handleRewardField(id, field, val) {
    setAdminRewards(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: field === 'cost' ? Math.max(1, parseInt(val) || 1) : val },
    }))
  }

  function handleSaveRewards() {
    saveRewardSettings(adminRewards)
    showToast('✅ המתנות נשמרו!')
  }

  function handleChangePin() {
    if (!/^\d{4}$/.test(newPin)) {
      showToast('❌ יש להזין בדיוק 4 ספרות')
      return
    }
    changeParentPin(newPin)
    setNewPin('')
    showToast('✅ הסיסמה עודכנה!')
  }

  function handleResetDay() {
    if (window.confirm('לאפס את משימות היום?')) {
      resetDay()
      showToast('🔄 יום חדש התחיל!')
    }
  }

  function handleResetAll() {
    if (window.confirm('למחוק את כל הנתונים? פעולה זו אינה ניתנת לביטול!')) {
      resetAll()
      setParentUnlocked(false)
      showToast('🗑️ כל הנתונים נמחקו')
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Profile header */}
      <div className="profile-header">
        <div className="avatar">{selectedAvatar}</div>
        <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 24 }}>
          {state.name || 'גיבור'}
        </div>
        <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>גיבור בריאות ⚡</div>
        <div
          style={{
            marginTop: 12,
            background: 'rgba(255,255,255,0.2)',
            borderRadius: 12,
            padding: '8px 16px',
            display: 'inline-block',
          }}
        >
          <span style={{ fontSize: 13 }}>רמה </span>
          <span style={{ fontFamily: "'Fredoka One', cursive", fontSize: 20 }}>{level}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-num">{state.totalCoins || 0}</div>
          <div className="stat-label">מטבעות<br />כולל</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{state.totalTasks || 0}</div>
          <div className="stat-label">משימות<br />הושלמו</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{state.streak || 0}</div>
          <div className="stat-label">ימי<br />רצף</div>
        </div>
      </div>

      {/* Settings */}
      <div className="section">
        <div className="section-title">⚙️ הגדרות</div>
        <div style={{ background: 'white', borderRadius: 18, padding: 18, boxShadow: 'var(--shadow)' }}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 13, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
              השם שלי
            </label>
            <input
              type="text"
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              placeholder="הכנס/י שם..."
              style={{
                width: '100%', padding: '10px 14px',
                border: '1.5px solid #E5E7EB', borderRadius: 12,
                fontFamily: "'Rubik', sans-serif", fontSize: 15,
                outline: 'none', direction: 'rtl',
              }}
            />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 13, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
              הפקטר שלי
            </label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {AVATARS.map(emoji => (
                <span
                  key={emoji}
                  onClick={() => setSelectedAvatar(emoji)}
                  style={{
                    fontSize: 28, cursor: 'pointer', padding: 4, borderRadius: 8,
                    background: selectedAvatar === emoji ? 'var(--purple-light)' : '',
                  }}
                >
                  {emoji}
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={handleSaveProfile}
            style={{
              width: '100%', padding: 12, borderRadius: 12, border: 'none',
              background: 'linear-gradient(135deg,var(--purple),#9333EA)',
              color: 'white', fontFamily: "'Rubik', sans-serif",
              fontWeight: 700, fontSize: 15, cursor: 'pointer',
            }}
          >
            שמור ✓
          </button>
        </div>
      </div>

      {/* Parent zone */}
      <div className="section" style={{ marginTop: 16 }}>
        <div className="section-title">🔐 אזור הורים</div>

        {!parentUnlocked ? (
          /* ── Locked state ── */
          <div className="parent-lock">
            <div className="lock-icon">🔒</div>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>אזור מוגן בסיסמה</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
              הגדר יעדים יומיים לילד/ה
            </div>

            {/* PIN dots */}
            <div className="pin-dots">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className={`pin-dot${i < pinBuffer.length ? ' filled' : ''}`} />
              ))}
            </div>
            <div className="pin-error">{pinError}</div>

            {/* PIN pad */}
            <div className="pin-pad">
              {['1','2','3','4','5','6','7','8','9'].map(d => (
                <button key={d} className="pin-key" onClick={() => pinPress(d)}>{d}</button>
              ))}
              <button className="pin-key del" onClick={pinClear}>✕</button>
              <button className="pin-key"     onClick={() => pinPress('0')}>0</button>
              <button className="pin-key del" onClick={pinBack}>⌫</button>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 12 }}>
              סיסמת ברירת מחדל: 1234
            </div>
          </div>
        ) : (
          /* ── Unlocked panel ── */
          <div style={{ background: 'white', borderRadius: 18, padding: 18, boxShadow: 'var(--shadow)' }}>
            {/* Header row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--purple)' }}>⚙️ יעדים יומיים</div>
              <button
                onClick={lockParent}
                style={{
                  border: 'none', background: 'var(--purple-light)', color: 'var(--purple)',
                  padding: '6px 12px', borderRadius: 10, fontWeight: 600,
                  fontSize: 12, cursor: 'pointer', fontFamily: "'Rubik', sans-serif",
                }}
              >
                🔒 נעל
              </button>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
              הפעל/כבה משימות ושנה כמות מטבעות
            </div>

            {/* Goal rows */}
            {TASKS.map(t => {
              const cfg = adminGoals[t.id] ?? { enabled: true, coins: t.coins }
              return (
                <div key={t.id} className="goal-row">
                  <span className="goal-emoji">{t.emoji}</span>
                  <div className="goal-info">
                    <div className="goal-name">{t.name}</div>
                  </div>
                  <input
                    className="goal-coins-input"
                    type="number"
                    min="1"
                    max="99"
                    value={cfg.coins}
                    onChange={e => handleGoalCoins(t.id, e.target.value)}
                  />
                  <span style={{ fontSize: 11, color: 'var(--gold-dark)' }}>🪙</span>
                  <button
                    className={`goal-toggle ${cfg.enabled ? 'on' : 'off'}`}
                    onClick={() => handleToggleGoal(t.id)}
                  />
                </div>
              )
            })}

            <button
              onClick={handleSaveGoals}
              style={{
                marginTop: 12, width: '100%', padding: 11, borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg,var(--teal),#0F9E7B)',
                color: 'white', fontFamily: "'Rubik', sans-serif",
                fontWeight: 700, fontSize: 14, cursor: 'pointer',
              }}
            >
              💾 שמור יעדים
            </button>

            {/* Rewards admin */}
            <div style={{ borderTop: '1px solid #F3F4F6', marginTop: 14, paddingTop: 14 }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10, color: 'var(--purple)' }}>
                🎁 ניהול מתנות
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
                הפעל/כבה מתנות ושנה עלות
              </div>
              {REWARDS.map(r => {
                const cfg = adminRewards[r.id] ?? { enabled: true, name: r.name, cost: r.cost }
                return (
                  <div key={r.id} className="goal-row">
                    <span className="goal-emoji">{r.emoji}</span>
                    <div className="goal-info">
                      <input
                        style={{
                          width: '100%', border: 'none', fontFamily: "'Rubik', sans-serif",
                          fontSize: 13, fontWeight: 600, background: 'transparent', outline: 'none',
                        }}
                        value={cfg.name}
                        onChange={e => handleRewardField(r.id, 'name', e.target.value)}
                      />
                    </div>
                    <input
                      className="goal-coins-input"
                      type="number"
                      min="1"
                      max="999"
                      value={cfg.cost}
                      onChange={e => handleRewardField(r.id, 'cost', e.target.value)}
                    />
                    <span style={{ fontSize: 11, color: 'var(--gold-dark)' }}>🪙</span>
                    <button
                      className={`goal-toggle ${cfg.enabled ? 'on' : 'off'}`}
                      onClick={() => handleToggleReward(r.id)}
                    />
                  </div>
                )
              })}
              <button
                onClick={handleSaveRewards}
                style={{
                  marginTop: 12, width: '100%', padding: 11, borderRadius: 12, border: 'none',
                  background: 'linear-gradient(135deg,var(--coral),#EA580C)',
                  color: 'white', fontFamily: "'Rubik', sans-serif",
                  fontWeight: 700, fontSize: 14, cursor: 'pointer',
                }}
              >
                💾 שמור מתנות
              </button>

              {/* Custom rewards */}
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #F3F4F6' }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
                  ➕ הוספת מתנה חדשה
                </div>
                <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                  <input
                    value={newRewardEmoji}
                    onChange={e => setNewRewardEmoji(e.target.value)}
                    style={{ width: 44, padding: '6px 4px', border: '1.5px solid #E5E7EB', borderRadius: 8, textAlign: 'center', fontSize: 18, outline: 'none' }}
                  />
                  <input
                    value={newRewardName}
                    onChange={e => setNewRewardName(e.target.value)}
                    placeholder="שם המתנה..."
                    style={{ flex: 1, padding: '6px 10px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontFamily: "'Rubik', sans-serif", fontSize: 13, outline: 'none', direction: 'rtl' }}
                  />
                  <input
                    type="number"
                    value={newRewardCost}
                    onChange={e => setNewRewardCost(Math.max(1, parseInt(e.target.value) || 1))}
                    className="goal-coins-input"
                  />
                  <span style={{ fontSize: 11, color: 'var(--gold-dark)', alignSelf: 'center' }}>🪙</span>
                </div>
                <button
                  onClick={() => {
                    if (!newRewardName.trim()) return
                    saveCustomReward({
                      id: 'custom-' + Date.now(),
                      emoji: newRewardEmoji || '🎁',
                      name: newRewardName.trim(),
                      cost: newRewardCost,
                    })
                    setNewRewardName('')
                    setNewRewardEmoji('🎁')
                    setNewRewardCost(50)
                    showToast('✅ מתנה נוספה!')
                  }}
                  style={{
                    width: '100%', padding: 10, borderRadius: 10, border: 'none',
                    background: 'var(--purple)', color: 'white',
                    fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 13, cursor: 'pointer',
                  }}
                >
                  ➕ הוסף מתנה
                </button>

                {/* List custom rewards */}
                {(rewardSettings.__custom ?? []).length > 0 && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>מתנות שנוספו:</div>
                    {(rewardSettings.__custom ?? []).map(r => (
                      <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid #F3F4F6' }}>
                        <span style={{ fontSize: 18 }}>{r.emoji}</span>
                        <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{r.name}</span>
                        <span style={{ fontSize: 12, color: 'var(--gold-dark)', fontWeight: 700 }}>🪙{r.cost}</span>
                        <button
                          onClick={() => { deleteCustomReward(r.id); showToast('🗑️ מתנה הוסרה') }}
                          style={{ border: 'none', background: 'none', color: '#EF4444', fontSize: 16, cursor: 'pointer', padding: '0 4px' }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Change PIN */}
            <div style={{ borderTop: '1px solid #F3F4F6', marginTop: 14, paddingTop: 14 }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10, color: 'var(--purple)' }}>
                🔐 שינוי סיסמה
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="password"
                  value={newPin}
                  onChange={e => setNewPin(e.target.value)}
                  maxLength={4}
                  placeholder="סיסמה חדשה (4 ספרות)"
                  style={{
                    flex: 1, padding: '9px 12px',
                    border: '1.5px solid #E5E7EB', borderRadius: 10,
                    fontFamily: "'Rubik', sans-serif", fontSize: 14,
                    outline: 'none', direction: 'rtl',
                  }}
                />
                <button
                  onClick={handleChangePin}
                  style={{
                    padding: '9px 14px', borderRadius: 10, border: 'none',
                    background: 'var(--purple)', color: 'white',
                    fontWeight: 700, fontSize: 13, cursor: 'pointer',
                    fontFamily: "'Rubik', sans-serif",
                  }}
                >
                  שמור
                </button>
              </div>
            </div>

            {/* Reset buttons */}
            <div style={{ borderTop: '1px solid #F3F4F6', marginTop: 14, paddingTop: 14 }}>
              <button
                onClick={handleResetDay}
                style={{
                  width: '100%', padding: 12, borderRadius: 12,
                  border: '1.5px solid #E5E7EB', background: 'white',
                  color: 'var(--text-muted)', fontFamily: "'Rubik', sans-serif",
                  fontWeight: 500, fontSize: 14, cursor: 'pointer',
                }}
              >
                🔄 איפוס יום חדש
              </button>
              <button
                onClick={handleResetAll}
                style={{
                  marginTop: 8, width: '100%', padding: 12, borderRadius: 12,
                  border: '1.5px solid #FECACA', background: '#FFF5F5',
                  color: '#EF4444', fontFamily: "'Rubik', sans-serif",
                  fontWeight: 500, fontSize: 14, cursor: 'pointer',
                }}
              >
                🗑️ איפוס מלא (מחיקת כל הנתונים)
              </button>
            </div>
          </div>
        )}
      </div>

      <div style={{ height: 20 }} />
    </>
  )
}

export default Profile
