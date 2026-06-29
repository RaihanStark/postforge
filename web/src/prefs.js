// Tiny localStorage-backed preferences, with a React hook. Mirrors Squadron's
// prefs helper so brief settings + history survive a reload.
import { useEffect, useState } from 'react'

const KEY = (k) => `postforge:${k}`

export function getPref(k, fallback) {
  try {
    const raw = localStorage.getItem(KEY(k))
    return raw == null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function setPref(k, v) {
  try { localStorage.setItem(KEY(k), JSON.stringify(v)) } catch { /* ignore quota / private mode */ }
}

export function usePref(k, fallback) {
  const [val, setVal] = useState(() => getPref(k, fallback))
  useEffect(() => { setPref(k, val) }, [k, val])
  return [val, setVal]
}
