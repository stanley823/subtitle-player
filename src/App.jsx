import { useState, useCallback } from 'react';
import SetupForm from './components/SetupForm';
import VideoPlayer from './components/VideoPlayer';
import PlaylistPanel from './components/PlaylistPanel';
import { parseSRT, expandEntries, alignEntries } from './utils/parseSRT';
import { fetchSrt } from './data/playlist';

function extractVideoId(url) {
  const patterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /\/embed\/([a-zA-Z0-9_-]{11})/,
    /\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m) return m[1];
  }
  return null;
}

function readFile(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload  = e => res(e.target.result);
    r.onerror = rej;
    r.readAsText(file, 'UTF-8');
  });
}

function buildSession(videoId, primaryContent, secondaryContent) {
  const rawPrimary = parseSRT(primaryContent);

  if (secondaryContent) {
    const rawSecondary = parseSRT(secondaryContent);
    const { primarySubs, secondarySubs } = alignEntries(rawPrimary, rawSecondary);
    const stats = `主字幕：${primarySubs.length} 句｜第二字幕：${secondarySubs.length} 句（對齊）`;
    return { videoId, primarySubs, secondarySubs, stats };
  }

  const primarySubs = expandEntries(rawPrimary);
  const stats = `主字幕：${rawPrimary.length} 段 → ${primarySubs.length} 句`;
  return { videoId, primarySubs, secondarySubs: [], stats };
}

export default function App() {
  const [session, setSession] = useState(null);
  const [error,   setError]   = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLoad = useCallback(async ({ url, primaryFile, secondaryFile }) => {
    setError(null);
    if (!url)         return setError('請輸入 YouTube 影片網址');
    if (!primaryFile) return setError('請選擇主要字幕 .srt 檔案');
    const videoId = extractVideoId(url);
    if (!videoId)     return setError('無法解析 YouTube 影片 ID，請確認網址格式正確。');
    try {
      const primaryContent   = await readFile(primaryFile);
      const secondaryContent = secondaryFile ? await readFile(secondaryFile) : null;
      setSession(buildSession(videoId, primaryContent, secondaryContent));
    } catch (e) {
      setError('載入失敗：' + e.message);
    }
  }, []);

  const handleLoadFromPlaylist = useCallback(async (item) => {
    setError(null);
    const videoId = extractVideoId(item.url);
    if (!videoId) return setError('無法解析影片 ID');
    setLoading(true);
    try {
      const [primaryContent, secondaryContent] = await Promise.all([
        fetchSrt(item.primary),
        fetchSrt(item.secondary),
      ]);
      if (!primaryContent) throw new Error('找不到主要字幕檔案');
      setSession(buildSession(videoId, primaryContent, secondaryContent));
    } catch (e) {
      setError('載入失敗：' + e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-[#e0e0e0] font-sans">
      <div className="max-w-[1200px] mx-auto px-3 py-4 sm:px-6 sm:py-7">

        {/* Header */}
        <header className="flex items-center gap-3 mb-7">
          <h1 className="text-[1.4rem] font-bold text-white tracking-tight">
            YouTube 字幕同步播放器
          </h1>
          <span className="text-[0.72rem] bg-[#cc0000] text-white px-2 py-0.5 rounded-full font-semibold tracking-wider">
            SRT SYNC
          </span>
        </header>

        <SetupForm onLoad={handleLoad} />

        <PlaylistPanel
          activeVideoId={session?.videoId}
          onSelect={handleLoadFromPlaylist}
        />

        {loading && (
          <div className="bg-[#1a1a2a] border border-[#334466] text-[#88aaff] px-4 py-2.5 rounded-lg text-sm mb-4">
            載入字幕中…
          </div>
        )}
        {!loading && error && (
          <div className="bg-[#2a1010] border border-[#aa2222] text-[#ffcccc] px-4 py-2.5 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        {session && (
          <VideoPlayer
            key={session.videoId}
            videoId={session.videoId}
            primarySubs={session.primarySubs}
            secondarySubs={session.secondarySubs}
            stats={session.stats}
          />
        )}

      </div>
    </div>
  );
}
