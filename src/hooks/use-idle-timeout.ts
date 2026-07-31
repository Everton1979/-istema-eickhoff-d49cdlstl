import { useEffect, useRef, useCallback } from 'react'

const IDLE_TIMEOUT = 15 * 60 * 1000

const EVENTS: (keyof WindowEventMap)[] = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart']

export function useIdleTimeout(enabled: boolean, onIdle: () => void) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onIdleRef = useRef(onIdle)

  useEffect(() => {
    onIdleRef.current = onIdle
  }, [onIdle])

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
    timerRef.current = setTimeout(() => {
      onIdleRef.current()
    }, IDLE_TIMEOUT)
  }, [])

  useEffect(() => {
    if (!enabled) {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
      return
    }

    resetTimer()

    for (const event of EVENTS) {
      window.addEventListener(event, resetTimer, { passive: true })
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
      for (const event of EVENTS) {
        window.removeEventListener(event, resetTimer)
      }
    }
  }, [enabled, resetTimer])
}
