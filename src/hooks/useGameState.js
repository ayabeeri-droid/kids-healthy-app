import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

// ── Static data ───────────────────────────────────────────────────────────────

export const TASKS = [
  { id: 'eat-fruit',    emoji: '🍎', name: 'אכלתי פרי',            desc: 'פרי = ויטמינים = כוח!',            coins: 5,  color: '#FFF0E6',           iconBg: '#F97316' },
  { id: 'eat-veggies',  emoji: '🥦', name: 'אכלתי ירקות',           desc: 'ירקות נותנים אנרגיה ועוצמה',       coins: 5,  color: '#F0FDF4',           iconBg: '#16A34A' },
  { id: 'no-junk',      emoji: '🚫', name: 'לא אכלתי חטיפים וממתקים וקינוחים היום', desc: 'נשמרתי מאוכל לא בריא',  coins: 8,  color: '#FFF0E6',           iconBg: '#EF4444' },
  { id: 'read',         emoji: '📚', name: 'קראתי ספר',              desc: '20 דקות קריאה לפחות',              coins: 8,  color: 'var(--blue-light)', iconBg: '#2563EB' },
  { id: 'puzzle',       emoji: '🧩', name: 'פתרתי חידה/פאזל',       desc: 'אתגרתי את המוח שלי!',              coins: 7,  color: '#EDE9FE',           iconBg: '#7C3AED' },
  { id: 'exercise',     emoji: '🏃', name: 'התאמנתי היום מעל שעה',   desc: 'שעה של פעילות גופנית!',            coins: 10, color: '#F0FDF4',           iconBg: '#0F9E7B' },
  { id: 'no-screen',    emoji: '📵', name: 'הייתי פחות משעה היום במסך', desc: 'פחות מסך = יותר חיים!',           coins: 8,  color: '#FDF2F8',           iconBg: '#EC4899' },
  { id: 'homework',     emoji: '✏️', name: 'הכנתי את כל שיעורי הבית', desc: 'סיימתי את כל המטלות להיום',       coins: 10, color: 'var(--blue-light)', iconBg: '#2563EB' },
  { id: 'chores',       emoji: '🧹', name: 'עזרתי בבית',             desc: 'סייעתי בסידור/ניקיון',             coins: 7,  color: '#FFF0E6',           iconBg: '#F59E0B' },
  { id: 'grandparents', emoji: '📞', name: 'התקשרתי לסבא/סבתא',    desc: 'שיחה חמה עם המשפחה',              coins: 10, color: '#FDF2F8',           iconBg: '#DB2777' },
  { id: 'creative',     emoji: '🎨', name: 'יצרתי משהו יצירתי',     desc: 'ציור, כתיבה, נגינה...',            coins: 7,  color: '#EDE9FE',           iconBg: '#8B5CF6' },
]

export const REWARDS = [
  { id: 'r1', emoji: '🎮', name: 'שעת משחק חופשית',     cost: 20  },
  { id: 'r2', emoji: '🍕', name: "פיצה עם החברים",       cost: 40  },
  { id: 'r3', emoji: '🎬', name: 'לבחור סרט במשפחה',     cost: 30  },
  { id: 'r4', emoji: '🛍️', name: 'קנייה בחנות',          cost: 60  },
  { id: 'r5', emoji: '🎂', name: 'יום הולדת מסעדה',      cost: 80  },
  { id: 'r6', emoji: '🎡', name: 'יציאה לפארק שעשועים',  cost: 100 },
  { id: 'r7', emoji: '🎧', name: 'אוזניות חדשות',         cost: 120 },
  { id: 'r8', emoji: '🏊', name: 'יום ספורט מגניב',       cost: 50  },
  { id: 'r9', emoji: '👕', name: 'חולצת כדורגל',          cost: 80  },
  { id: 'r10', emoji: '🏓', name: 'משחק פאדל',            cost: 60  },
]

// ── Device ID (used as Supabase row key when no auth) ────────────────────────

function getDeviceId() {
  let id = localStorage.getItem('hero-device-id')
  if (!id) {
    id = Math.random().toString(36).substring(2) + Date.now().toString(36)
    localStorage.setItem('hero-device-id', id)
  }
  return id
}

// ── Default state ─────────────────────────────────────────────────────────────

const DEFAULT_STATE = {
  coins: 0,
  totalCoins: 0,
  completedTasks: [],
  waterGlasses: 0,
  streak: 0,
  totalTasks: 0,
  name: '',
  avatar: '😎',
  lastDay: '',
  activityLog: [],     // [{id, taskId, emoji, name, coins, time, date}]
  pendingApproval: [], // tasks awaiting parent approval (same shape)
}

// ── New-day check (pure, runs on the loaded state object) ─────────────────────

function applyNewDayCheck(s) {
  const today = new Date().toDateString()
  if (!s.lastDay) return { ...s, lastDay: today }
  if (s.lastDay === today) return s

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const hadStreak = s.lastDay === yesterday.toDateString() && s.completedTasks.length >= 3

  return {
    ...s,
    completedTasks: [],
    waterGlasses: 0,
    pendingApproval: [],
    streak: hadStreak ? (s.streak || 0) + 1 : 0,
    lastDay: today,
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useGameState() {
  const [state, setState] = useState(DEFAULT_STATE)
  const [goalSettings, setGoalSettings] = useState({})
  const [rewardSettings, setRewardSettings] = useState({})
  const [parentPin, setParentPin] = useState('1234')

  // Keep a ref so async Supabase callbacks always see latest values
  const latestRef = useRef({ state, goalSettings, rewardSettings, parentPin })
  useEffect(() => { latestRef.current = { state, goalSettings, rewardSettings, parentPin } }, [state, goalSettings, rewardSettings, parentPin])

  // ── Bootstrap ──────────────────────────────────────────────────────────────

  useEffect(() => {
    // 1. Load localStorage
    let initial = { ...DEFAULT_STATE }
    const saved = localStorage.getItem('hero-app')
    if (saved) {
      try { initial = { ...initial, ...JSON.parse(saved) } } catch (_) { /* ignore */ }
    }

    // 2. Apply new-day logic
    initial = applyNewDayCheck(initial)

    // 3. Persist any new-day changes back
    localStorage.setItem('hero-app', JSON.stringify(initial))
    setState(initial)

    // 4. Load goal settings, reward settings & pin
    const savedGoals = localStorage.getItem('hero-goals')
    if (savedGoals) {
      try { setGoalSettings(JSON.parse(savedGoals)) } catch (_) { /* ignore */ }
    }
    const savedRewards = localStorage.getItem('hero-rewards')
    if (savedRewards) {
      try { setRewardSettings(JSON.parse(savedRewards)) } catch (_) { /* ignore */ }
    }
    const savedPin = localStorage.getItem('hero-pin')
    if (savedPin) setParentPin(savedPin)

    // 5. Optionally sync from Supabase (overrides local if more recent)
    loadFromSupabase()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Supabase sync (debounced, 1 s after last change) ──────────────────────

  useEffect(() => {
    if (!supabase) return
    const timer = setTimeout(() => syncToSupabase(), 1000)
    return () => clearTimeout(timer)
  }, [state, goalSettings, rewardSettings, parentPin]) // eslint-disable-line react-hooks/exhaustive-deps

  async function loadFromSupabase() {
    if (!supabase) return
    try {
      const { data } = await supabase
        .from('game_state')
        .select('*')
        .eq('user_id', getDeviceId())
        .single()

      if (!data) return

      setState(prev => applyNewDayCheck({
        ...prev,
        coins:           data.coins          ?? prev.coins,
        totalCoins:      data.total_coins     ?? prev.totalCoins,
        completedTasks:  data.completed_tasks ?? prev.completedTasks,
        waterGlasses:    data.water_glasses   ?? prev.waterGlasses,
        streak:          data.streak          ?? prev.streak,
        totalTasks:      data.total_tasks     ?? prev.totalTasks,
        name:            data.name            ?? prev.name,
        avatar:          data.avatar          ?? prev.avatar,
        lastDay:         data.last_day        ?? prev.lastDay,
      }))
      if (data.goal_settings) setGoalSettings(data.goal_settings)
      if (data.parent_pin)    setParentPin(data.parent_pin)
    } catch (_) { /* Supabase not reachable — use localStorage */ }
  }

  async function syncToSupabase() {
    if (!supabase) return
    const { state: s, goalSettings: gs, parentPin: pin } = latestRef.current
    try {
      await supabase.from('game_state').upsert({
        user_id:         getDeviceId(),
        coins:           s.coins,
        total_coins:     s.totalCoins,
        completed_tasks: s.completedTasks,
        water_glasses:   s.waterGlasses,
        streak:          s.streak,
        total_tasks:     s.totalTasks,
        name:            s.name,
        avatar:          s.avatar,
        last_day:        s.lastDay,
        goal_settings:   gs,
        parent_pin:      pin,
        updated_at:      new Date().toISOString(),
      })
    } catch (_) { /* ignore — data is safe in localStorage */ }
  }

  // ── Internal helpers ───────────────────────────────────────────────────────

  function persist(newState) {
    localStorage.setItem('hero-app', JSON.stringify(newState))
    // Supabase sync fires via useEffect above
  }

  function updateState(updater) {
    setState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }
      persist(next)
      return next
    })
  }

  // ── Public actions ─────────────────────────────────────────────────────────

  // Returns 'done' | 'pending' — Home.jsx uses this to decide which UI to show
  function completeTask(task) {
    const requireApproval = goalSettings.requireApproval === true

    if (requireApproval) {
      setState(prev => {
        if (prev.completedTasks.includes(task.id)) return prev
        if ((prev.pendingApproval || []).some(p => p.taskId === task.id)) return prev
        const entry = {
          id:     Date.now().toString(),
          taskId: task.id,
          emoji:  task.emoji,
          name:   task.name,
          coins:  task.coins,
          time:   new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
          date:   new Date().toDateString(),
        }
        const next = { ...prev, pendingApproval: [...(prev.pendingApproval || []), entry] }
        persist(next)
        return next
      })
      return 'pending'
    }

    updateState(prev => {
      if (prev.completedTasks.includes(task.id)) return prev
      const entry = {
        id:     Date.now().toString(),
        taskId: task.id,
        emoji:  task.emoji,
        name:   task.name,
        coins:  task.coins,
        time:   new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
        date:   new Date().toDateString(),
      }
      return {
        ...prev,
        completedTasks: [...prev.completedTasks, task.id],
        totalTasks:     (prev.totalTasks || 0) + 1,
        coins:          prev.coins + task.coins,
        totalCoins:     (prev.totalCoins || 0) + task.coins,
        lastDay:        new Date().toDateString(),
        activityLog:    [...(prev.activityLog || []), entry].slice(-60),
      }
    })
    return 'done'
  }

  // Returns true if reaching 10 glasses for the first time today (caller shows modal)
  function toggleGlass(index) {
    let waterCompleted = false
    setState(prev => {
      const wasComplete = prev.waterGlasses >= 10
      const newWater = index < prev.waterGlasses ? index : index + 1
      const nowComplete = newWater >= 10 && !wasComplete

      if (nowComplete) waterCompleted = true

      const next = {
        ...prev,
        waterGlasses: newWater,
        ...(nowComplete && {
          coins:      prev.coins + 10,
          totalCoins: (prev.totalCoins || 0) + 10,
        }),
      }
      persist(next)
      return next
    })
    return waterCompleted
  }

  function buyReward(reward) {
    updateState(prev => ({ ...prev, coins: prev.coins - reward.cost }))
  }

  function saveProfile(name, avatar) {
    updateState(prev => ({ ...prev, name, avatar }))
  }

  function resetDay() {
    updateState(prev => ({
      ...prev,
      completedTasks:  [],
      waterGlasses:    0,
      pendingApproval: [],
      lastDay:         new Date().toDateString(),
    }))
  }

  function approveTask(entryId) {
    setState(prev => {
      const entry = (prev.pendingApproval || []).find(p => p.id === entryId)
      if (!entry) return prev
      const logEntry = { ...entry, date: new Date().toDateString() }
      const next = {
        ...prev,
        pendingApproval: prev.pendingApproval.filter(p => p.id !== entryId),
        completedTasks:  [...prev.completedTasks, entry.taskId],
        totalTasks:      (prev.totalTasks || 0) + 1,
        coins:           prev.coins + entry.coins,
        totalCoins:      (prev.totalCoins || 0) + entry.coins,
        lastDay:         new Date().toDateString(),
        activityLog:     [...(prev.activityLog || []), logEntry].slice(-60),
      }
      persist(next)
      return next
    })
  }

  function rejectTask(entryId) {
    setState(prev => {
      const next = { ...prev, pendingApproval: prev.pendingApproval.filter(p => p.id !== entryId) }
      persist(next)
      return next
    })
  }

  function resetAll() {
    const fresh = { ...DEFAULT_STATE, lastDay: new Date().toDateString() }
    setState(fresh)
    setGoalSettings({})
    setRewardSettings({})
    setParentPin('1234')
    localStorage.removeItem('hero-app')
    localStorage.removeItem('hero-goals')
    localStorage.removeItem('hero-rewards')
    localStorage.removeItem('hero-pin')
    persist(fresh)
  }

  function saveGoalSettings(settings) {
    setGoalSettings(settings)
    localStorage.setItem('hero-goals', JSON.stringify(settings))
  }

  function saveRewardSettings(settings) {
    setRewardSettings(settings)
    localStorage.setItem('hero-rewards', JSON.stringify(settings))
  }

  function changeParentPin(pin) {
    setParentPin(pin)
    localStorage.setItem('hero-pin', pin)
  }

  function getEffectiveTasks() {
    return TASKS
      .filter(t => {
        const cfg = goalSettings[t.id]
        return !cfg || cfg.enabled !== false
      })
      .map(t => {
        const cfg = goalSettings[t.id]
        return cfg ? { ...t, coins: cfg.coins } : t
      })
  }

  function getEffectiveRewards() {
    const base = REWARDS
      .filter(r => {
        const cfg = rewardSettings[r.id]
        return !cfg || cfg.enabled !== false
      })
      .map(r => {
        const cfg = rewardSettings[r.id]
        return cfg ? { ...r, name: cfg.name ?? r.name, cost: cfg.cost ?? r.cost } : r
      })
    // Append custom rewards added by parents
    const custom = rewardSettings.__custom ?? []
    return [...base, ...custom]
  }

  function saveCustomReward(reward) {
    setRewardSettings(prev => {
      const custom = prev.__custom ?? []
      const next = { ...prev, __custom: [...custom, reward] }
      localStorage.setItem('hero-rewards', JSON.stringify(next))
      return next
    })
  }

  function deleteCustomReward(id) {
    setRewardSettings(prev => {
      const custom = (prev.__custom ?? []).filter(r => r.id !== id)
      const next = { ...prev, __custom: custom }
      localStorage.setItem('hero-rewards', JSON.stringify(next))
      return next
    })
  }

  const level = Math.floor((state.totalCoins || 0) / 50) + 1

  return {
    state,
    goalSettings,
    rewardSettings,
    parentPin,
    level,
    completeTask,
    toggleGlass,
    buyReward,
    saveProfile,
    resetDay,
    resetAll,
    approveTask,
    rejectTask,
    saveGoalSettings,
    saveRewardSettings,
    changeParentPin,
    getEffectiveTasks,
    getEffectiveRewards,
    saveCustomReward,
    deleteCustomReward,
  }
}
