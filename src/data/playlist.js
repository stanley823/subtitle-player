const SUBS = '/subtitles/'

/** Fetch playlist metadata from public/subtitles/playlist.json */
export async function fetchPlaylist() {
  const res = await fetch(`${SUBS}playlist.json`)
  if (!res.ok) throw new Error(`無法載入播放清單 (${res.status})`)
  const items = await res.json()
  return items // caller decides what to filter/show
}

/** Fetch a single SRT file's text content. Returns null if not available. */
export async function fetchSrt(filename) {
  if (!filename) return null
  const res = await fetch(`${SUBS}${filename}`)
  if (!res.ok) return null
  return res.text()
}
