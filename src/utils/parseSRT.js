/**
 * Parses a raw SRT string into an array of subtitle entries.
 * @param {string} raw - Raw SRT file content
 * @returns {{ start: number, end: number, text: string }[]}
 */
export function parseSRT(raw) {
  const text = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const blocks = text.trim().split(/\n[ \t]*\n/);
  const entries = [];

  for (const block of blocks) {
    const lines = block.trim().split('\n');
    const tcIdx = lines.findIndex(l => l.includes('-->'));
    if (tcIdx === -1) continue;

    const m = lines[tcIdx].match(
      /(\d{1,2}:\d{2}:\d{2}[,.:]\d{1,3})\s*-->\s*(\d{1,2}:\d{2}:\d{2}[,.:]\d{1,3})/
    );
    if (!m) continue;

    const start = tcToSec(m[1]);
    const end   = tcToSec(m[2]);
    const body  = lines.slice(tcIdx + 1).join(' ').trim();
    if (body) entries.push({ start, end, text: body });
  }

  return entries;
}

function tcToSec(tc) {
  const [hms, ms = '0'] = tc.split(/[,.]/);
  const [h, min, s] = hms.split(':').map(Number);
  return h * 3600 + min * 60 + s + parseInt(ms.padEnd(3, '0')) / 1000;
}

/**
 * Splits long subtitle entries at sentence boundaries and redistributes
 * their time range proportionally by character count.
 * @param {{ start: number, end: number, text: string }[]} entries
 * @returns {{ start: number, end: number, text: string }[]}
 */
export function expandEntries(entries) {
  const result = [];

  for (const { start, end, text } of entries) {
    const duration = end - start;

    // Ensure space after sentence-ending punctuation before a capital letter
    const spaced = text.replace(/([.!?])([A-Z])/g, '$1 $2');
    const sentences = spaced
      .split(/(?<=[.!?])\s+/)
      .map(s => s.trim())
      .filter(Boolean);

    if (sentences.length <= 1) {
      result.push({ start, end, text });
      continue;
    }

    const totalChars = sentences.reduce((n, s) => n + s.length, 0);
    let t = start;

    for (const s of sentences) {
      const dur = duration * (s.length / totalChars);
      result.push({ start: t, end: t + dur, text: s });
      t += dur;
    }
  }

  return result;
}

/**
 * Binary-searches for the subtitle entry active at time `t`.
 * @param {{ start: number, end: number, text: string }[]} subs
 * @param {number} t - Current playback time in seconds
 * @returns {{ start: number, end: number, text: string } | null}
 */
export function findSub(subs, t) {
  let lo = 0, hi = subs.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (subs[mid].end < t)        lo = mid + 1;
    else if (subs[mid].start > t) hi = mid - 1;
    else return subs[mid];
  }
  return null;
}
