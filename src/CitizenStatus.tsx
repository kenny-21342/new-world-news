import { useEffect, useState } from 'react'
import { Pill, Smile } from 'lucide-react'
import './CitizenStatus.css'

const SOMA_KEY = 'brave-new-world-soma-next-v1'
const DAY = 24 * 60 * 60 * 1000

function loadNextSomaTime() {
  const now = Date.now()
  try {
    const saved = Number(localStorage.getItem(SOMA_KEY))
    if (Number.isFinite(saved) && saved > now) return saved
    const next = now + DAY
    localStorage.setItem(SOMA_KEY, String(next))
    return next
  } catch {
    return now + DAY
  }
}

function formatCountdown(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(' : ')
}

export default function CitizenStatus() {
  const [nextSomaTime, setNextSomaTime] = useState(loadNextSomaTime)
  const [remaining, setRemaining] = useState(() => Math.max(0, nextSomaTime - Date.now()))

  useEffect(() => {
    const update = () => {
      const now = Date.now()
      const left = nextSomaTime - now
      if (left > 0) {
        setRemaining(left)
        return
      }
      const cycles = Math.floor((now - nextSomaTime) / DAY) + 1
      const next = nextSomaTime + cycles * DAY
      try {
        localStorage.setItem(SOMA_KEY, String(next))
      } catch {
        // The countdown still works when storage is unavailable.
      }
      setNextSomaTime(next)
      setRemaining(next - now)
    }
    update()
    const timer = window.setInterval(update, 1000)
    return () => window.clearInterval(timer)
  }, [nextSomaTime])

  const countdown = formatCountdown(remaining)

  return (
    <section className="citizen-status-grid" aria-label="世界公民公共状态">
      <div className="soma-countdown-card">
        <span className="citizen-status-icon"><Pill size={25} strokeWidth={1.5} /></span>
        <div className="soma-countdown-copy">
          <span>DAILY SOMA DISPENSARY</span>
          <h2>距离领取嗦麻</h2>
          <p>每日下班领取一次 · 24 小时循环</p>
        </div>
        <div className="soma-countdown-time">
          <time role="timer" aria-live="off" aria-label={`距离领取嗦麻还有 ${countdown}`}>{countdown}</time>
          <small>小时 : 分钟 : 秒</small>
        </div>
      </div>
      <div className="happiness-index-card">
        <span className="happiness-icon"><Smile size={27} strokeWidth={1.5} /></span>
        <div className="happiness-copy">
          <span>HAPPINESS INDEX</span>
          <h2>全民快乐指数</h2>
        </div>
        <strong className="happiness-value">100<small>%</small></strong>
        <span className="happiness-stable"><i /> 持续稳定</span>
      </div>
    </section>
  )
}
