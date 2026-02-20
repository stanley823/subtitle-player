import { useState, useEffect } from 'react';
import { fetchPlaylist } from '../data/playlist';

export default function PlaylistPanel({ activeVideoId, onSelect }) {
  const [items, setItems] = useState([]);
  const [open,  setOpen]  = useState(true);

  useEffect(() => {
    fetchPlaylist()
      .then(data => setItems(data.filter(d => d.primary)))
      .catch(() => {});
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="mb-4 rounded-[10px] border border-[#242424] bg-[#141414] overflow-hidden">

      {/* Toggle header */}
      <button
        className="w-full bg-transparent border-0 flex justify-between items-center px-3.5 py-[9px]"
        onClick={() => setOpen(v => !v)}
      >
        <span className="flex items-center gap-[7px] text-[0.75rem] font-semibold tracking-[0.05em] uppercase text-[#555]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#cc0000] inline-block shrink-0" />
          快速載入
          <span className="text-[#3a3a3a] font-normal normal-case tracking-normal text-[0.73rem]">
            {items.length} 集
          </span>
        </span>
        <span className={`text-[0.8rem] text-[#3a3a3a] inline-block transition-transform duration-200 ${open ? 'rotate-0' : '-rotate-90'}`}>
          ▾
        </span>
      </button>

      {/* Scrollable card row */}
      {open && (
        <div className="overflow-x-auto border-t border-[#1e1e1e] hide-scrollbar">
          <div className="flex gap-2 px-3.5 py-2.5 w-max">
            {items.map(item => {
              const active = activeVideoId && item.url.includes(activeVideoId);
              return (
                <button
                  key={item.num ?? item.short}
                  className={`bg-transparent border rounded-lg px-3 py-2 flex items-center gap-[7px] min-w-[120px] max-w-[160px] text-left transition-colors shrink-0 ${
                    active
                      ? 'border-[#cc0000] bg-[rgba(204,0,0,0.06)]'
                      : 'border-[#262626] hover:border-[#333]'
                  }`}
                  onClick={e => { e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' }); onSelect(item); }}
                  title={`${item.num ? `#${item.num} · ` : ''}${item.short}`}
                >
                  <span className={`text-[0.72rem] font-bold shrink-0 tracking-tight ${active ? 'text-[#cc4444]' : 'text-[#444]'}`}>
                    {item.num ? `#${item.num}` : '★'}
                  </span>
                  <span className="text-[0.78rem] text-[#888] leading-snug flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                    {item.short}
                  </span>
                  {item.secondary && (
                    <span className="text-[0.62rem] bg-[#1e2a1e] text-[#5a8a5a] border border-[#2a3e2a] px-1 py-0.5 rounded font-semibold shrink-0">
                      中
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
