import { demoApi } from './demo.js'

export const PARAMS = new URLSearchParams(typeof location !== 'undefined' ? location.search : '')
// ?demo runs the whole UI against canned data — no backend / Claude needed.
export const DEMO = PARAMS.has('demo')

export const api = (path, opts) => {
  if (DEMO) return demoApi(path, opts)
  return fetch(path, opts).then((r) => {
    if (!r.ok) return r.json().then((e) => { throw new Error(e.error || r.statusText) })
    return r.json()
  })
}
