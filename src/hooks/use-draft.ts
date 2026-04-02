import { useState, useEffect, useCallback } from 'react'

export function useDraft<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn('Error reading draft from localStorage', error)
      return initialValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.warn('Error saving draft to localStorage', error)
    }
  }, [key, value])

  const clearDraft = useCallback(() => {
    try {
      window.localStorage.removeItem(key)
      setValue(initialValue)
    } catch (error) {
      console.warn('Error clearing draft from localStorage', error)
    }
  }, [key, initialValue])

  return [value, setValue, clearDraft] as const
}
