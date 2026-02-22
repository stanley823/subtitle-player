/**
 * Parses a raw SRT string into an array of subtitle entries.
 * @param {string} raw - Raw SRT file content
 * @returns {{ start: number, end: number, text: string }[]}
 */
export function parseSRT(raw) {
  const text = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  const blocks = text.trim().split(/\n[ \t]*\n/)
  const entries = []

  for (const block of blocks) {
    const lines = block.trim().split('\n')
    const tcIdx = lines.findIndex((l) => l.includes('-->'))
    if (tcIdx === -1) continue

    const m = lines[tcIdx].match(
      /(\d{1,2}:\d{2}:\d{2}[,.:]\d{1,3})\s*-->\s*(\d{1,2}:\d{2}:\d{2}[,.:]\d{1,3})/
    )
    if (!m) continue

    const start = tcToSec(m[1])
    const end = tcToSec(m[2])
    const body = lines
      .slice(tcIdx + 1)
      .join(' ')
      .trim()
    if (body) entries.push({ start, end, text: body })
  }

  return entries
}

function tcToSec(tc) {
  const [hms, ms = '0'] = tc.split(/[,.]/)
  const [h, min, s] = hms.split(':').map(Number)
  return h * 3600 + min * 60 + s + parseInt(ms.padEnd(3, '0')) / 1000
}

const MAX_CHARS = 100

/**
 * Recursively splits a single string at the word/CJK-punctuation boundary
 * nearest to its midpoint until every chunk is within MAX_CHARS.
 */
function splitLong(text) {
  if (text.length <= MAX_CHARS) return [text]

  const mid = Math.floor(text.length / 2)
  // Search outward from midpoint for a natural break (space or CJK punctuation)
  for (let d = 0; d <= mid; d++) {
    for (const pos of [mid - d, mid + d]) {
      if (pos <= 0 || pos >= text.length) continue
      if (/[\s，、；。！？]/.test(text[pos])) {
        const left = text.slice(0, pos + 1).trim()
        const right = text.slice(pos + 1).trim()
        if (left && right) return [...splitLong(left), ...splitLong(right)]
      }
    }
  }
  // Fallback: hard-break at MAX_CHARS when no natural break exists
  return [
    ...splitLong(text.slice(0, MAX_CHARS)),
    ...splitLong(text.slice(MAX_CHARS))
  ]
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

/** Split one text block into sentence-level chunks via splitLong. */
function toChunks(text) {
  const spaced = text.replace(/([.!?])([A-Z])/g, '$1 $2')
  const sentences = spaced
    .split(/(?<=[.!?])\s+|(?<=[。！？])/)
    .map((s) => s.trim())
    .filter(Boolean)
  const chunks = sentences.flatMap(splitLong)
  return chunks.length > 0 ? chunks : [text]
}

/**
 * Compute cumulative character-ratio boundaries for an array of chunks.
 * Returns length chunks.length + 1, spanning [0, 1].
 */
function toRatios(chunks) {
  const total = chunks.reduce((n, s) => n + s.length, 0) || 1
  const ratios = [0]
  let acc = 0
  for (const chunk of chunks) {
    acc += chunk.length
    ratios.push(acc / total)
  }
  return ratios
}

/** Return the chunk whose ratio interval contains r. */
function chunkAt(chunks, ratios, r) {
  for (let i = 0; i < chunks.length; i++) {
    if (r >= ratios[i] && r < ratios[i + 1]) return chunks[i]
  }
  return chunks[chunks.length - 1] ?? ''
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Splits long subtitle entries at sentence boundaries then further at
 * word boundaries so no chunk exceeds MAX_CHARS. Time is redistributed
 * proportionally by character count.
 * @param {{ start: number, end: number, text: string }[]} entries
 * @returns {{ start: number, end: number, text: string }[]}
 */
export function expandEntries(entries) {
  const result = []

  for (const { start, end, text } of entries) {
    const duration = end - start
    const chunks = toChunks(text)

    if (chunks.length <= 1) {
      result.push({ start, end, text })
      continue
    }

    const ratios = toRatios(chunks)
    for (let i = 0; i < chunks.length; i++) {
      result.push({
        start: start + ratios[i] * duration,
        end: start + ratios[i + 1] * duration,
        text: chunks[i]
      })
    }
  }

  return result
}

/**
 * Aligns primary and secondary subtitle entries by merging their split-point
 * ratios within each shared block, so both tracks always occupy the same
 * time slots and can be read side-by-side.
 *
 * @param {{ start: number, end: number, text: string }[]} primaryEntries
 * @param {{ start: number, end: number, text: string }[]} secondaryEntries
 * @returns {{ primarySubs: object[], secondarySubs: object[] }}
 */
export function alignEntries(primaryEntries, secondaryEntries) {
  const primarySubs = []
  const secondarySubs = []
  const len = Math.min(primaryEntries.length, secondaryEntries.length)

  for (let i = 0; i < len; i++) {
    const pe = primaryEntries[i]
    const se = secondaryEntries[i]
    const { start, end } = pe
    const duration = end - start

    const pChunks = toChunks(pe.text)
    const sChunks = toChunks(se.text)
    const pRatios = toRatios(pChunks)
    const sRatios = toRatios(sChunks)

    // Use the denser track as the master timeline so both tracks always
    // switch at the same moment — the sparser track simply holds its text
    // across consecutive slots rather than jumping at a different time.
    const [mainChunks, mainRatios, otherChunks, otherRatios, primaryIsMain] =
      pChunks.length >= sChunks.length
        ? [pChunks, pRatios, sChunks, sRatios, true]
        : [sChunks, sRatios, pChunks, pRatios, false]

    for (let j = 0; j < mainChunks.length; j++) {
      const rMid = (mainRatios[j] + mainRatios[j + 1]) / 2
      const slotStart = start + mainRatios[j] * duration
      const slotEnd = start + mainRatios[j + 1] * duration
      const mainText = mainChunks[j]
      const otherText = chunkAt(otherChunks, otherRatios, rMid)

      primarySubs.push({
        start: slotStart,
        end: slotEnd,
        text: primaryIsMain ? mainText : otherText
      })
      secondarySubs.push({
        start: slotStart,
        end: slotEnd,
        text: primaryIsMain ? otherText : mainText
      })
    }
  }

  // Primary blocks beyond secondary coverage — fall back to expandEntries
  for (let i = len; i < primaryEntries.length; i++) {
    const { start, end, text } = primaryEntries[i]
    const duration = end - start
    const chunks = toChunks(text)
    if (chunks.length <= 1) {
      primarySubs.push({ start, end, text })
      continue
    }
    const ratios = toRatios(chunks)
    for (let j = 0; j < chunks.length; j++) {
      primarySubs.push({
        start: start + ratios[j] * duration,
        end: start + ratios[j + 1] * duration,
        text: chunks[j]
      })
    }
  }

  return { primarySubs, secondarySubs }
}

/**
 * Binary-searches for the subtitle entry active at time `t`.
 * @param {{ start: number, end: number, text: string }[]} subs
 * @param {number} t - Current playback time in seconds
 * @returns {{ start: number, end: number, text: string } | null}
 */
export function findSub(subs, t) {
  let lo = 0,
    hi = subs.length - 1
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    if (subs[mid].end < t) lo = mid + 1
    else if (subs[mid].start > t) hi = mid - 1
    else return subs[mid]
  }
  return null
}
