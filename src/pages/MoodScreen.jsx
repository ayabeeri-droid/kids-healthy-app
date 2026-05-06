const MOODS = [
  { emoji: '😊', label: 'שמח/ה',     color: '#FFFDE7', border: '#FDD835' },
  { emoji: '😢', label: 'עצוב/ה',    color: '#E3F2FD', border: '#42A5F5' },
  { emoji: '😡', label: 'כועס/ת',    color: '#FFEBEE', border: '#EF5350' },
  { emoji: '😰', label: 'מפחד/ת',    color: '#EDE7F6', border: '#AB47BC' },
  { emoji: '😴', label: 'עייף/ה',    color: '#F3E5F5', border: '#CE93D8' },
  { emoji: '🤒', label: 'לא טוב',    color: '#E8F5E9', border: '#66BB6A' },
  { emoji: '😐', label: 'בסדר',      color: '#F5F5F5', border: '#BDBDBD' },
  { emoji: '🤩', label: 'נרגש/ת',    color: '#FFF3E0', border: '#FFA726' },
]

function MoodScreen({ childName, onSelect }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 20px',
      background: 'var(--bg)',
    }}>
      <div style={{ fontSize: 56, marginBottom: 12 }}>🌟</div>

      <div style={{
        fontFamily: "'Fredoka One', cursive",
        fontSize: 30,
        color: 'var(--purple)',
        marginBottom: 6,
        textAlign: 'center',
      }}>
        בוקר טוב{childName ? `, ${childName}` : ''}!
      </div>

      <div style={{
        fontSize: 17,
        color: 'var(--text-muted)',
        marginBottom: 36,
        textAlign: 'center',
        lineHeight: 1.5,
      }}>
        איך אתה/את מרגיש/ה היום?
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 12,
        width: '100%',
        maxWidth: 380,
      }}>
        {MOODS.map(mood => (
          <button
            key={mood.emoji}
            onClick={() => onSelect(mood)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '18px 8px 14px',
              background: mood.color,
              border: `2px solid ${mood.border}`,
              borderRadius: 18,
              cursor: 'pointer',
              fontFamily: "'Rubik', sans-serif",
              boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
              transition: 'transform 0.12s, box-shadow 0.12s',
            }}
            onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.93)' }}
            onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)' }}
            onTouchStart={e => { e.currentTarget.style.transform = 'scale(0.93)' }}
            onTouchEnd={e => { e.currentTarget.style.transform = 'scale(1)' }}
          >
            <span style={{ fontSize: 40, marginBottom: 8, lineHeight: 1 }}>{mood.emoji}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#374151', textAlign: 'center' }}>
              {mood.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default MoodScreen
