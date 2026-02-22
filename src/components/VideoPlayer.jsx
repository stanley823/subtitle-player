import { useRef, useState, useEffect, useCallback } from 'react';
import YouTube from 'react-youtube';
import SubtitleOverlay from './SubtitleOverlay';
import SettingsModal from './SettingsModal';
import { useSubtitleSync } from '../hooks/useSubtitleSync';
import { usePreferences } from '../hooks/usePreferences';

function fmtTime(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${m}:${String(s).padStart(2, '0')}`;
}

const RATIO_PAD = { '16:9': 56.25, '4:3': 75, '21:9': 42.857, '9:16': 177.78 };

const MODE_BUTTONS = [
  { key: 'off',       label: '關閉' },
  { key: 'primary',   label: '原文' },
  { key: 'both',      label: '原文＋譯文' },
  { key: 'secondary', label: '譯文' },
];

export default function VideoPlayer({ videoId, primarySubs, secondarySubs, stats }) {
  const playerRef     = useRef(null);
  const lastSaved     = useRef(0);
  const [embedError,   setEmbedError]  = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const {
    videoSettings,  setVideoSettings,
    subtitleStyles, setSubtitleStyles,
    subtitleMode,   setSubtitleMode,
    saveProgress,   getProgress,
  } = usePreferences();

  const { primary, secondary, currentTime } = useSubtitleSync(
    playerRef, primarySubs, secondarySubs
  );

  // Save playback progress every 5 s of elapsed time
  useEffect(() => {
    if (currentTime > 0 && currentTime - lastSaved.current >= 5) {
      saveProgress(videoId, currentTime);
      lastSaved.current = currentTime;
    }
  }, [currentTime, videoId, saveProgress]);

  const visiblePrimary   = (subtitleMode === 'primary'   || subtitleMode === 'both') ? primary   : null;
  const visibleSecondary = (subtitleMode === 'secondary' || subtitleMode === 'both') ? secondary : null;
  const isActive = primary !== null || secondary !== null;

  // Dynamic wrapper styles (aspect ratio + user-controlled width)
  const wrapperStyle = {
    width: `${videoSettings.width}%`,
    margin: '0 auto',
    paddingBottom: `${RATIO_PAD[videoSettings.aspectRatio] ?? 56.25}%`,
  };

  const onReady = useCallback((e) => {
    playerRef.current = e.target;
    setEmbedError(null);
    const saved = getProgress(videoId);
    if (saved > 10) e.target.seekTo(saved, true);
  }, [videoId, getProgress]);

  const onError = useCallback((e) => {
    if (e.data === 101 || e.data === 150) setEmbedError('此影片的擁有者不允許在外部網站播放。');
    else if (e.data === 100)              setEmbedError('找不到此影片，請確認網址是否正確。');
    else                                  setEmbedError(`播放器發生錯誤（代碼：${e.data}）`);
  }, []);

  const opts = {
    width: '100%', height: '100%',
    playerVars: { autoplay: 1, rel: 0, modestbranding: 1, cc_load_policy: 0 },
  };

  return (
    <div>
      {/* Video wrapper — ratio & width are dynamic */}
      <div
        className="relative bg-black rounded-[14px] overflow-hidden"
        style={wrapperStyle}
      >
        <YouTube
          videoId={videoId}
          opts={opts}
          onReady={onReady}
          onError={onError}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
          iframeClassName="yt-iframe"
        />

        <SubtitleOverlay
          primary={visiblePrimary}
          secondary={visibleSecondary}
          subtitleStyles={subtitleStyles}
        />

        {embedError && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[rgba(20,0,0,0.92)] border border-[#aa2222] text-[#ffffcc] px-7 py-5 rounded-xl text-[0.95rem] text-center max-w-[80%] leading-relaxed z-20">
            <strong className="block mb-1.5 text-[#ff8080]">無法播放此影片</strong>
            {embedError}
            <br />
            <a
              href={`https://www.youtube.com/watch?v=${videoId}`}
              target="_blank" rel="noreferrer"
              className="text-[#88aaff] mt-2 inline-block"
            >
              在 YouTube 上觀看 ↗
            </a>
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="flex justify-between items-center mt-3 gap-3 flex-wrap">

        {/* Sync indicator */}
        <div className="flex items-center gap-[7px] shrink-0">
          <div
            className="w-[7px] h-[7px] rounded-full transition-colors duration-300"
            style={{ background: isActive ? '#cc0000' : '#333' }}
          />
          <span className="text-[#555] text-[0.78rem]">
            {currentTime > 0
              ? isActive
                ? `${fmtTime(currentTime)} — 字幕同步中`
                : `${fmtTime(currentTime)} — 無字幕`
              : '等待播放...'}
          </span>
        </div>

        {/* Controls: mode group + settings button */}
        <div className="flex items-center gap-2 max-sm:w-full max-sm:justify-between">

          {/* Segmented mode toggle */}
          <div className="flex overflow-hidden bg-[#1a1a1a] border border-[#2e2e2e] rounded-lg max-sm:flex-1">
            {MODE_BUTTONS.map(({ key, label }) => (
              <button
                key={key}
                className={`bg-transparent border-0 text-[0.75rem] px-2.5 py-[5px] whitespace-nowrap transition-colors ${
                  subtitleMode === key
                    ? key === 'off'
                      ? 'bg-[#2a2a2a] text-[#cc4444]'
                      : 'bg-[#2a2a2a] text-[#ddd]'
                    : 'text-[#555] hover:text-[#888]'
                }`}
                onClick={() => setSubtitleMode(key)}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Settings */}
          <button
            className="bg-transparent border border-[#2e2e2e] text-[#555] text-[0.9rem] w-[30px] h-[30px] rounded-lg flex items-center justify-center transition-colors hover:text-[#888] hover:border-[#444]"
            onClick={() => setSettingsOpen(true)}
            title="播放器設定"
          >
            ⚙
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="text-[#333] text-[0.75rem] mt-1.5 text-right">{stats}</div>

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        subtitleStyles={subtitleStyles}
        onSubtitleChange={setSubtitleStyles}
        videoSettings={videoSettings}
        onVideoChange={setVideoSettings}
      />
    </div>
  );
}
