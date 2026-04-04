import { useState } from 'react'
import Home    from './pages/Home'
import Shop    from './pages/Shop'
import Profile from './pages/Profile'
import { useGameState } from './hooks/useGameState'

function spawnConfetti() {
  const colors = ['#7C3AED', '#EC4899', '#F97316', '#FFD700', '#16A34A', '#2563EB']
  for (let i = 0; i < 18; i++) {
    const el = document.createElement('div')
    el.className = 'confetti-piece'
    el.style.cssText = `
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      left: ${20 + Math.random() * 60}%;
      top: ${10 + Math.random() * 30}%;
      animation-delay: ${(Math.random() * 0.4).toFixed(2)}s;
      animation-duration: ${(1 + Math.random() * 0.8).toFixed(2)}s;
      transform: rotate(${Math.floor(Math.random() * 360)}deg);
    `
    document.body.appendChild(el)
    setTimeout(() => el.remove(), 2400)
  }
}

export default function App() {
  const [currentTab, setCurrentTab] = useState('home')
  const [modal, setModal] = useState({ open: false, emoji: '', title: '', desc: '' })
  const [toast, setToast] = useState({ show: false, message: '' })

  const gameState = useGameState()

  // ── Notification helpers passed to pages ───────────────────────────────────

  function showModal(emoji, title, desc) {
    setModal({ open: true, emoji, title, desc })
  }

  function closeModal() {
    setModal(prev => ({ ...prev, open: false }))
  }

  function showToast(message) {
    setToast({ show: true, message })
    setTimeout(() => setToast({ show: false, message: '' }), 2500)
  }

  const notifications = { showModal, showToast, spawnConfetti }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Decorative background blobs */}
      <div className="bg-decor" aria-hidden>
        <span /><span /><span />
      </div>

      {/* Toast */}
      <div className={`toast${toast.show ? ' show' : ''}`}>{toast.message}</div>

      {/* Modal */}
      <div
        className={`modal-overlay${modal.open ? ' open' : ''}`}
        onClick={e => { if (e.target === e.currentTarget) closeModal() }}
      >
        <div className="modal">
          <div className="modal-handle" />
          <div style={{ textAlign: 'center', fontSize: 56, marginBottom: 12 }}>
            {modal.emoji}
          </div>
          <div className="modal-title">{modal.title}</div>
          <div className="modal-desc" style={{ whiteSpace: 'pre-line' }}>{modal.desc}</div>
          <button className="modal-btn primary" onClick={closeModal}>אחלה! 🚀</button>
          <button className="modal-btn secondary" onClick={closeModal}>סגור</button>
        </div>
      </div>

      {/* App shell */}
      <div className="app">
        {currentTab === 'home' && (
          <Home
            gameState={gameState}
            onSwitchTab={setCurrentTab}
            notifications={notifications}
          />
        )}
        {currentTab === 'shop' && (
          <Shop
            gameState={gameState}
            notifications={notifications}
          />
        )}
        {currentTab === 'profile' && (
          <Profile
            gameState={gameState}
            notifications={notifications}
          />
        )}

        {/* Bottom nav */}
        <nav className="bottom-nav">
          {[
            { id: 'home',    icon: '🏠', label: 'בית'   },
            { id: 'shop',    icon: '🎁', label: 'חנות'  },
            { id: 'profile', icon: '👤', label: 'פרופיל' },
          ].map(tab => (
            <button
              key={tab.id}
              className={`nav-btn${currentTab === tab.id ? ' active' : ''}`}
              onClick={() => setCurrentTab(tab.id)}
            >
              <span className="nav-icon">{tab.icon}</span>
              <span className="nav-label">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </>
  )
}
