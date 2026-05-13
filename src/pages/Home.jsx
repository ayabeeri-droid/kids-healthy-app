function Home({ gameState, onSwitchTab, notifications }) {
  const { state, level, getEffectiveTasks, toggleGlass, toggleBottle, completeTask } = gameState
  const { showModal, showToast, spawnConfetti } = notifications

  function handleToggleBottle(index) {
    const coinAwarded = toggleBottle(index)
    const isAdding = index >= state.waterBottles
    if (coinAwarded) {
      spawnConfetti()
      showModal('💧', 'כל הכבוד!', 'שתית מספיק מים היום!\nקיבלת 🪙10 מטבעות!')
    } else if (isAdding) {
      showToast('🍼 בקבוק נוסף! כל הכבוד!')
    }
  }

  function handleToggleGlass(index) {
    const coinAwarded = toggleGlass(index)
    const isAdding = index >= state.waterGlasses
    if (coinAwarded) {
      spawnConfetti()
      showModal('💧', 'כל הכבוד!', 'שתית מספיק מים היום!\nקיבלת 🪙10 מטבעות!')
    } else if (isAdding) {
      showToast('🥤 כוס מים נוספת! יופי!')
    }
  }

  function handleCompleteTask(task) {
    const result = completeTask(task)
    if (result === 'pending') {
      showToast(`⏳ "${task.name}" ממתין לאישור הורה`)
    } else {
      spawnConfetti()
      showModal(task.emoji, 'בום! 🎉', `השלמת: "${task.name}"\nקיבלת 🪙${task.coins} מטבעות!`)
    }
  }

  const effectiveTasks = getEffectiveTasks()

  // Water reward thresholds
  const BOTTLE_GOAL = 5
  const GLASS_GOAL  = 4
  const bottlesDone = state.waterBottles >= BOTTLE_GOAL
  const glassesDone = state.waterGlasses >= GLASS_GOAL

  return (
    <>
      {/* Header */}
      <div className="header">
        <div className="header-top">
          <div>
            <div className="greeting">שלום,</div>
            <div className="user-name">
              {state.name ? `${state.name} ⚡` : 'גיבור/ה! ⚡'}
            </div>
          </div>
          <div className="level-badge">
            <span className="lvl">{level}</span>
            <span>רמה</span>
          </div>
        </div>

        {/* Today's mood chip */}
        {state.todayMood && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,0.25)', borderRadius: 20,
            padding: '4px 12px', marginTop: 8, fontSize: 13, fontWeight: 600,
          }}>
            <span style={{ fontSize: 20 }}>{state.todayMood.emoji}</span>
            <span>היום מרגיש/ה {state.todayMood.label}</span>
          </div>
        )}

        <div className="coin-bar">
          <div className="coin-icon">🪙</div>
          <div className="coin-info">
            <div className="coin-count">{state.coins}</div>
            <div className="coin-label">מטבעות גיבור</div>
          </div>
          <button className="coin-btn" onClick={() => onSwitchTab('shop')}>
            🎁 חנות
          </button>
        </div>
      </div>

      {/* Streak */}
      <div className="section">
        <div className="streak-card">
          <div className="streak-fire">🔥</div>
          <div>
            <div className="streak-days">{state.streak || 0}</div>
            <div className="streak-label">ימי רצף</div>
          </div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 13, opacity: 0.9, fontWeight: 500 }}>
              המשך כך ואתה<br />על הדרך להיות
            </div>
            <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 18 }}>
              גיבור אמיתי! 💪
            </div>
          </div>
        </div>
      </div>

      {/* Water Tracker */}
      <div className="section">
        <div className="section-title">💧 מד המים היומי</div>
        <div className="water-card">

          {/* Small bottles row */}
          <div className="water-header">
            <div className="water-title">🍼 בקבוקים קטנים</div>
            <div className="water-count">
              <span style={{ color: bottlesDone ? '#16A34A' : 'inherit' }}>{state.waterBottles}</span>/{BOTTLE_GOAL}
            </div>
          </div>
          <div className="water-glasses" style={{ marginBottom: 4 }}>
            {Array.from({ length: BOTTLE_GOAL }, (_, i) => (
              <div
                key={i}
                onClick={() => handleToggleBottle(i)}
                style={{
                  width: 38, height: 38, borderRadius: 10, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22,
                  background: i < state.waterBottles ? '#DBEAFE' : '#F3F4F6',
                  border: i < state.waterBottles ? '2px solid #3B82F6' : '2px solid #E5E7EB',
                  transition: 'all 0.15s',
                }}
              >
                {i < state.waterBottles ? '🍼' : ''}
              </div>
            ))}
            {bottlesDone && <span style={{ fontSize: 18, marginRight: 4 }}>✅</span>}
          </div>

          {/* Regular glasses row */}
          <div className="water-header" style={{ marginTop: 10 }}>
            <div className="water-title">🥤 כוסות מים</div>
            <div className="water-count">
              <span style={{ color: glassesDone ? '#16A34A' : 'inherit' }}>{state.waterGlasses}</span>/{GLASS_GOAL}
            </div>
          </div>
          <div className="water-glasses" style={{ marginBottom: 4 }}>
            {Array.from({ length: GLASS_GOAL }, (_, i) => (
              <div
                key={i}
                className={`glass${i < state.waterGlasses ? ' filled' : ''}`}
                onClick={() => handleToggleGlass(i)}
              />
            ))}
            {glassesDone && <span style={{ fontSize: 18, marginRight: 4 }}>✅</span>}
          </div>

          {/* Combined progress */}
          <div className="water-progress-bar" style={{ marginTop: 10 }}>
            <div
              className="water-fill"
              style={{
                width: `${Math.min(100, ((state.waterBottles / BOTTLE_GOAL) + (state.waterGlasses / GLASS_GOAL)) / 2 * 100)}%`,
              }}
            />
          </div>

          {state.waterCoinAwarded ? (
            <div style={{ fontSize: 12, color: '#16A34A', marginTop: 6, fontWeight: 700 }}>
              ✅ קיבלת 🪙10 על שתיה מספקת היום!
            </div>
          ) : (
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
              מלא {BOTTLE_GOAL} בקבוקים ו-{GLASS_GOAL} כוסות = 🪙+10
            </div>
          )}
        </div>
      </div>

      {/* Tasks */}
      <div className="section">
        <div className="section-title">⚡ משימות היום</div>
        <div className="tasks-grid">
          {effectiveTasks.map(task => {
            const done    = state.completedTasks.includes(task.id)
            const pending = !done && (state.pendingApproval || []).some(p => p.taskId === task.id)
            return (
              <div
                key={task.id}
                className={`task-card${done ? ' done' : ''}`}
                style={{ background: done ? task.color : pending ? '#FFF9E6' : task.color, opacity: pending ? 0.85 : 1 }}
                onClick={!done && !pending ? () => handleCompleteTask(task) : undefined}
              >
                <div
                  className="task-icon-wrap"
                  style={{ background: `${task.iconBg}20` }}
                >
                  <span style={{ fontSize: 24 }}>{task.emoji}</span>
                </div>
                <div className="task-content">
                  <div className="task-name">{task.name}</div>
                  <div className="task-desc">
                    {pending ? '⏳ ממתין לאישור הורה' : task.desc}
                  </div>
                </div>
                <div className="task-reward">🪙{task.coins}</div>
                <div
                  className="task-check"
                  style={
                    done
                      ? { background: 'var(--green)', borderColor: 'var(--green)', color: 'white' }
                      : pending
                      ? { background: '#F59E0B', borderColor: '#F59E0B', color: 'white', fontSize: 12 }
                      : {}
                  }
                >
                  {done ? '✓' : pending ? '⏳' : ''}
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

export default Home
