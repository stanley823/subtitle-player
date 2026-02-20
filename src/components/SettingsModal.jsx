import { useEffect, useState } from 'react';

// ─── Defaults ─────────────────────────────────────────────────────────────────

export const defaultSubtitleStyles = {
  primary: {
    fontSize: 22,
    color: '#ffffff',
    backgroundColor: 'rgba(0,0,0,0.78)',
  },
  secondary: {
    fontSize: 17,
    color: '#fde08d',
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
};

export const defaultVideoSettings = {
  width: 100,
  aspectRatio: '16:9',
};

// ─── Constants ────────────────────────────────────────────────────────────────

const ASPECT_RATIOS = [
  { label: '16:9', value: '16:9', hint: '標準' },
  { label: '4:3',  value: '4:3',  hint: '復古' },
  { label: '21:9', value: '21:9', hint: '超寬' },
  { label: '9:16', value: '9:16', hint: 'Shorts' },
];

const TABS = [
  { key: 'video',     label: '影片尺寸' },
  { key: 'primary',   label: '主字幕' },
  { key: 'secondary', label: '第二字幕' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseRgba(rgba) {
  const m = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (!m) return { r: 0, g: 0, b: 0, a: 0.78 };
  return { r: +m[1], g: +m[2], b: +m[3], a: m[4] !== undefined ? +m[4] : 1 };
}

function toHex({ r, g, b }) {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

function toRgba({ r, g, b }, a) {
  return `rgba(${r},${g},${b},${a})`;
}

// ─── Shared primitives ────────────────────────────────────────────────────────

function SectionTitle({ children }) {
  return (
    <p className="text-[#888] text-[0.73rem] font-semibold tracking-[0.07em] uppercase mb-1">
      {children}
    </p>
  );
}

function ControlRow({ label, children }) {
  return (
    <div className="flex items-center gap-2.5">
      <label className="text-[#ccc] text-[0.84rem] min-w-[72px] shrink-0">{label}</label>
      {children}
    </div>
  );
}

function Value({ children }) {
  return (
    <span className="text-[#666] text-[0.78rem] min-w-[46px] text-right tabular-nums">
      {children}
    </span>
  );
}

function Slider({ value, min, max, step = 1, onChange }) {
  return (
    <input
      type="range" min={min} max={max} step={step} value={value}
      onChange={e => onChange(+e.target.value)}
      className="flex-1 accent-[#cc0000]"
    />
  );
}

function ColorPicker({ value, onChange }) {
  return (
    <input
      type="color" value={value}
      onChange={e => onChange(e.target.value)}
      className="w-[34px] h-[26px] border border-[#444] rounded-md p-0.5 bg-transparent cursor-pointer shrink-0"
    />
  );
}

// ─── Video section ────────────────────────────────────────────────────────────

function AspectRatioIcon({ ratio, active }) {
  const [w, h] = ratio.split(':').map(Number);
  const capped = Math.min(Math.round((h / w) * 28), 36);
  const actualW = Math.round((w / h) * capped);
  return (
    <div style={{
      width: actualW,
      height: capped,
      border: `1.5px solid ${active ? '#cc0000' : '#444'}`,
      borderRadius: 2,
      flexShrink: 0,
    }} />
  );
}

function VideoSection({ settings, onChange }) {
  const set = (key, value) => onChange({ ...settings, [key]: value });

  return (
    <div className="flex flex-col gap-3">

      <SectionTitle>影片寬度</SectionTitle>

      <ControlRow label="寬度">
        <Slider value={settings.width} min={30} max={100} step={5} onChange={v => set('width', v)} />
        <Value>{settings.width}%</Value>
      </ControlRow>

      {/* Quick presets */}
      <ControlRow label="">
        <div className="flex gap-1.5 flex-1 flex-wrap">
          {[50, 70, 85, 100].map(w => (
            <button
              key={w}
              onClick={() => set('width', w)}
              className={`bg-transparent border rounded-md text-[0.78rem] px-2.5 py-1 transition-colors ${
                settings.width === w
                  ? 'border-[#cc0000] text-[#ddd]'
                  : 'border-[#333] text-[#666] hover:border-[#555] hover:text-[#aaa]'
              }`}
            >
              {w}%
            </button>
          ))}
        </div>
      </ControlRow>

      <div className="h-1" />
      <SectionTitle>長寬比</SectionTitle>

      <div className="flex gap-2 flex-wrap">
        {ASPECT_RATIOS.map(({ label, value, hint }) => (
          <button
            key={value}
            onClick={() => set('aspectRatio', value)}
            className={`bg-transparent border rounded-lg px-3 py-2 flex flex-col items-center gap-1.5 flex-1 min-w-[60px] transition-colors ${
              settings.aspectRatio === value
                ? 'border-[#cc0000] bg-[rgba(204,0,0,0.06)]'
                : 'border-[#333] hover:border-[#555]'
            }`}
          >
            <AspectRatioIcon ratio={value} active={settings.aspectRatio === value} />
            <span className="text-[#ccc] text-[0.82rem] font-semibold">{label}</span>
            <span className="text-[#555] text-[0.7rem]">{hint}</span>
          </button>
        ))}
      </div>

      {/* Live proportion preview */}
      <div className="bg-[#111] rounded-lg p-3 flex justify-center items-center border border-[#2a2a2a] min-h-[60px]">
        <div
          className="bg-[#222] border border-[#333] rounded flex items-center justify-center transition-all duration-200"
          style={{
            width: `${settings.width}%`,
            aspectRatio: settings.aspectRatio.replace(':', '/'),
            maxHeight: 120,
          }}
        >
          <span className="text-[#444] text-[0.75rem] font-semibold tracking-[0.04em]">
            {settings.aspectRatio}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Subtitle section ─────────────────────────────────────────────────────────

function SubtitleSection({ trackKey, settings, onChange }) {
  const bg  = parseRgba(settings.backgroundColor);
  const upd = (key, value) => onChange(trackKey, key, value);

  return (
    <div className="flex flex-col gap-3">
      <SectionTitle>{trackKey === 'primary' ? '主要字幕' : '第二字幕'}</SectionTitle>

      <ControlRow label="文字大小">
        <Slider value={settings.fontSize} min={12} max={48} onChange={v => upd('fontSize', v)} />
        <Value>{settings.fontSize}px</Value>
      </ControlRow>

      <ControlRow label="文字顏色">
        <ColorPicker value={settings.color} onChange={v => upd('color', v)} />
        <Value>{settings.color}</Value>
      </ControlRow>

      <ControlRow label="背景顏色">
        <ColorPicker
          value={toHex(bg)}
          onChange={hex => {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            upd('backgroundColor', toRgba({ r, g, b }, bg.a));
          }}
        />
        <Value>{toHex(bg)}</Value>
      </ControlRow>

      <ControlRow label="背景透明度">
        <Slider
          value={Math.round(bg.a * 100)} min={0} max={100}
          onChange={v => upd('backgroundColor', toRgba(bg, v / 100))}
        />
        <Value>{Math.round(bg.a * 100)}%</Value>
      </ControlRow>

      {/* Live preview */}
      <div
        className="px-3 py-2 rounded-md text-center border border-[#2a2a2a]"
        style={{ backgroundColor: settings.backgroundColor }}
      >
        <span style={{ color: settings.color, fontSize: settings.fontSize, lineHeight: 1.5 }}>
          {trackKey === 'primary' ? '這是主要字幕預覽' : 'Secondary subtitle preview'}
        </span>
      </div>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export default function SettingsModal({
  open, onClose,
  subtitleStyles, onSubtitleChange,
  videoSettings,  onVideoChange,
}) {
  const [activeTab, setActiveTab] = useState('video');

  useEffect(() => {
    if (!open) return;
    const handler = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubChange = (track, key, value) =>
    onSubtitleChange({ ...subtitleStyles, [track]: { ...subtitleStyles[track], [key]: value } });

  const handleReset = () => {
    onSubtitleChange(defaultSubtitleStyles);
    onVideoChange(defaultVideoSettings);
  };

  return (
    <div
      className="fixed inset-0 bg-black/55 backdrop-blur-sm flex items-center justify-center z-[200]"
      onClick={onClose}
    >
      <div
        className="bg-[#1c1c1c] border border-[#2e2e2e] rounded-2xl w-[460px] max-w-[95vw] max-h-[88vh] flex flex-col shadow-[0_24px_64px_rgba(0,0,0,0.7)] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-5 pt-4 pb-3 border-b border-[#2a2a2a] shrink-0">
          <span className="text-white font-semibold text-[0.95rem] tracking-tight">
            播放器設定
          </span>
          <button
            className="bg-transparent border-0 text-[#666] text-[0.95rem] px-2 py-1 rounded-md leading-none hover:text-[#aaa] transition-colors"
            onClick={onClose}
            title="關閉"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#2a2a2a] shrink-0 px-5 gap-0.5 overflow-x-auto hide-scrollbar">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`bg-transparent border-0 border-b-2 text-[0.82rem] px-3 pt-2.5 pb-2 whitespace-nowrap -mb-px transition-colors ${
                activeTab === key
                  ? 'text-[#ddd] border-[#cc0000]'
                  : 'text-[#555] border-transparent hover:text-[#888]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1">
          {activeTab === 'video'     && <VideoSection    settings={videoSettings}          onChange={onVideoChange} />}
          {activeTab === 'primary'   && <SubtitleSection trackKey="primary"   settings={subtitleStyles.primary}   onChange={handleSubChange} />}
          {activeTab === 'secondary' && <SubtitleSection trackKey="secondary" settings={subtitleStyles.secondary} onChange={handleSubChange} />}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-5 py-3 border-t border-[#2a2a2a] shrink-0 bg-[#1c1c1c]">
          <button
            onClick={handleReset}
            className="bg-transparent border border-[#3a3a3a] text-[#777] px-3.5 py-[7px] rounded-lg text-[0.82rem] hover:text-[#aaa] hover:border-[#555] transition-colors"
          >
            全部重置
          </button>
          <button
            onClick={onClose}
            className="bg-[#cc0000] border-0 text-white px-[22px] py-2 rounded-lg text-[0.85rem] font-semibold hover:bg-[#aa0000] transition-colors"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
}
