const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
const WEEKDAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

export const WEEK_ORDER = [
  { key: 'mon', label: 'Monday' },
  { key: 'tue', label: 'Tuesday' },
  { key: 'wed', label: 'Wednesday' },
  { key: 'thu', label: 'Thursday' },
  { key: 'fri', label: 'Friday' },
  { key: 'sat', label: 'Saturday' },
  { key: 'sun', label: 'Sunday' },
]

export function getNow() {
  if (typeof window !== 'undefined') {
    const nowParam = new URLSearchParams(window.location.search).get('now')
    if (nowParam) {
      const parsed = new Date(nowParam)
      if (!Number.isNaN(parsed.getTime())) return parsed
    }
  }
  return new Date()
}

function toMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

export function formatTime(hhmm) {
  const [hStr, mStr] = hhmm.split(':')
  let h = Number(hStr)
  const m = Number(mStr)
  const period = h >= 12 ? 'pm' : 'am'
  h = h % 12 || 12
  return m === 0 ? `${h}${period}` : `${h}:${String(m).padStart(2, '0')}${period}`
}

function dateStr(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function inSeason(season, now) {
  if (!season) return true
  const today = dateStr(now)
  return today >= season.start && today <= season.end
}

export function getTodayKey(now = getNow()) {
  return DAY_KEYS[now.getDay()]
}

export function formatDayRanges(ranges) {
  if (!ranges || ranges.length === 0) return 'Closed'
  return ranges.map(([start, end]) => `${formatTime(start)}–${formatTime(end)}`).join(', ')
}

export function isOpenNow(source, now = getNow()) {
  if (!source.hours) return false
  if (!inSeason(source.season, now)) return false

  const todayRanges = source.hours[DAY_KEYS[now.getDay()]] ?? []
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  return todayRanges.some(
    ([start, end]) => nowMinutes >= toMinutes(start) && nowMinutes < toMinutes(end),
  )
}

export function getStatusLine(source, now = getNow()) {
  if (!source.hours) return { text: 'Hours not listed', open: false }
  if (!inSeason(source.season, now)) return { text: 'Out of season', open: false }

  const dayIndex = now.getDay()
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  const todayRanges = source.hours[DAY_KEYS[dayIndex]] ?? []

  const activeRange = todayRanges.find(
    ([start, end]) => nowMinutes >= toMinutes(start) && nowMinutes < toMinutes(end),
  )
  if (activeRange) {
    return { text: `Open until ${formatTime(activeRange[1])}`, open: true }
  }

  const nextToday = todayRanges
    .filter(([start]) => toMinutes(start) > nowMinutes)
    .sort((a, b) => toMinutes(a[0]) - toMinutes(b[0]))[0]
  if (nextToday) {
    return { text: `Opens today at ${formatTime(nextToday[0])}`, open: false }
  }

  for (let offset = 1; offset <= 7; offset++) {
    const dayKey = DAY_KEYS[(dayIndex + offset) % 7]
    const ranges = source.hours[dayKey]
    if (ranges && ranges.length > 0) {
      const earliest = [...ranges].sort((a, b) => toMinutes(a[0]) - toMinutes(b[0]))[0]
      const weekday = WEEKDAY_NAMES[(dayIndex + offset) % 7]
      return { text: `Next open ${weekday} ${formatTime(earliest[0])}`, open: false }
    }
  }

  return { text: 'Hours not listed', open: false }
}
