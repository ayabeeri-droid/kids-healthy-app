function Home({ gameState, onSwitchTab, notifications }) {
  const { state, level, getEffectiveTasks, toggleGlass, completeTask } = gameState
  const { showModal, showToast, spawnConfetti } = notifications

  function handleToggleGlass(index) {
    const wasComplete    = state.waterGlasses >= 10
    const isAdding       = index >= state.waterGlasses
    const willComplete   = isAdding && index + 1 >= 10

    const completed = toggleGlass(index)

    if (!wasComplete && willComplete && completed) {
      showModal('💧', 'כל הכבוד!', 'שתית 2.5 ליטר מים! קיבלת 🪙10')
    } else if (isAdding) {
      showToast('💧 שתית עוד כוס מים! יופי!')
    }
  }

  function handleCompleteTask(task) {
    completeTask(task)
    spawnConfetti()
    showModal(task.emoji, 'בום! 🎉', `השלמת: "${task.name}"\nקיבלת 🪙${task.coins} מטבעות!`)
  }

  const effectiveTasks = getEffectiveTasks()

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
          <div className="water-header">
            <div className="water-title">🥤 כוסות מים</div>
            <div className="water-count">
              <span>{state.waterGlasses}</span>/10
            </div>
          </div>
          <div className="water-glasses">
            {Array.from({ length: 10 }, (_, i) => (
              <div
                key={i}
                className={`glass${i < state.waterGlasses ? ' filled' : ''}`}
                onClick={() => handleToggleGlass(i)}
              />
            ))}
          </div>
          <div className="water-progress-bar">
            <div
              className="water-fill"
              style={{ width: `${state.waterGlasses * 10}%` }}
            />
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
            כל 10 כוסות = 2.5 ליטר = 🪙+10
          </div>
        </div>
      </div>

      {/* Tasks */}
      <div className="section">
        <div className="section-title">⚡ משימות היום</div>
        <div className="tasks-grid">
          {effectiveTasks.map(task => {
            const done = state.completedTasks.includes(task.id)
            return (
              <div
                key={task.id}
                className={`task-card${done ? ' done' : ''}`}
                style={{ background: task.color }}
                onClick={!done ? () => handleCompleteTask(task) : undefined}
              >
                <div
                  className="task-icon-wrap"
                  style={{ background: `${task.iconBg}20` }}
                >
                  <span style={{ fontSize: 24 }}>{task.emoji}</span>
                </div>
                <div className="task-content">
                  <div className="task-name">{task.name}</div>
                  <div className="task-desc">{task.desc}</div>
                </div>
                <div className="task-reward">🪙{task.coins}</div>
                <div
                  className="task-check"
                  style={
                    done
                      ? { background: 'var(--green)', borderColor: 'var(--green)', color: 'white' }
                      : {}
                  }
                >
                  {done ? '✓' : ''}
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
