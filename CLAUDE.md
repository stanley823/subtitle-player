# CLAUDE.md

## Project Overview

YouTube 字幕同步播放器 — 支援雙語字幕對照的語言學習工具。純前端靜態網站，無後端。

**Production:** https://subtitle-player-rust.vercel.app

## Tech Stack

- React 19 + Vite 7 + Tailwind CSS 4
- react-youtube (YouTube IFrame API wrapper)
- Vercel (deployment)
- No TypeScript, no external state management

## Commands

```bash
npm run dev       # Dev server (localhost:5173)
npm run build     # Production build → dist/
npm run preview   # Preview production build
npm run lint      # ESLint
```

## Project Structure

```
src/
├── components/        # React UI components
│   ├── SetupForm.jsx      # Manual URL/SRT upload
│   ├── VideoPlayer.jsx    # Player wrapper + controls
│   ├── SubtitleOverlay.jsx # Subtitle display layer
│   ├── PlaylistPanel.jsx   # Playlist browser
│   └── SettingsModal.jsx   # Settings UI
├── hooks/
│   ├── useSubtitleSync.js  # Syncs subs with playback (100ms polling)
│   └── usePreferences.js   # localStorage persistence
├── utils/
│   └── parseSRT.js         # SRT parsing, expand, align
├── data/
│   └── playlist.js         # Fetch playlist.json + SRT files
├── App.jsx                 # Root component, state management
├── index.css               # Tailwind imports + global styles
└── main.jsx                # Entry point

public/subtitles/
├── playlist.json            # Video/subtitle metadata
└── *.srt                    # Subtitle files (EN + zh-TW pairs)

_specs/                      # Feature spec templates
```

## Key Patterns

- **Functional components only** with hooks (useState, useEffect, useCallback, useRef)
- **No Redux/Zustand** — all state via React hooks + localStorage
- **Custom hooks** for feature isolation (usePreferences, useSubtitleSync)
- **Tailwind CSS exclusively** for styling; inline styles only for dynamic values
- **Dark theme** default (#0f0f0f, #1a1a1a background; #cc0000 accent)
- **UI language: Traditional Chinese (Taiwan)** — all labels, messages in zh-TW

## Naming Conventions

- Components: `PascalCase` (VideoPlayer, SetupForm)
- Functions: `camelCase` (fetchPlaylist, expandEntries)
- Constants: `UPPER_SNAKE_CASE` (MAX_CHARS, STORAGE_KEY)
- Refs: suffixed with `Ref` (playerRef, urlRef)

## Subtitle System

- SRT files stored in `public/subtitles/` as static assets
- `playlist.json` groups videos by playlist with primary/secondary SRT pairs
- `parseSRT.js` handles: parsing → expandEntries (split long subs) → alignEntries (sync two tracks)
- Binary search for O(log n) subtitle lookup during playback
- MAX_CHARS = 100 per subtitle chunk; CJK-aware sentence splitting

### playlist.json Entry Format

```json
{
  "playlist": "group name",
  "num": 1,
  "short": "short title",
  "url": "https://youtube.com/...",
  "primary": "filename.srt",
  "secondary": "filename_zh-TW.srt"
}
```

### SRT File Naming

- English: `Video_Title_Here.srt` (underscores, no spaces)
- zh-TW: `Video_Title_Here_zh-TW.srt`

## Subtitle Translation Glossary

When translating or editing zh-TW subtitle files, use these consistent terms:

| English | zh-TW | Notes |
|---------|-------|-------|
| Agent Teams | Agent Teams | Keep in English |
| Team Lead | Team Lead | Keep in English |
| sub-agent | 子代理 | NOT 子代理人 |
| skill (Claude feature) | skill | Keep in English |
| prompt (noun) | 提示詞 | NOT 提示 |
| context window | 上下文視窗 | NOT 情境視窗 |
| context (AI sense) | 上下文 | NOT 情境 |
| reasoning effort | 推理強度 | NOT 推理力度/努力程度 |
| devil's advocate | 魔鬼代言人 | NOT 反方辯護者 |
| build (software) | 建構 | NOT 建造 |
| ship code | 交付程式碼 | NOT 寫程式碼 |
| bake in | 內建 | NOT 烘培 |

## Spec-Driven Workflow

Use `_specs/template.md` for feature planning. Create specs before implementing non-trivial features.

## Deployment

Push to `main` branch, then deploy with:

```bash
npx vercel --prod
```
