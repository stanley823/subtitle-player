import { useState, useEffect } from 'react';
import { fetchPlaylist } from '../data/playlist';

/** Group an array of items by item[key], preserving insertion order. */
function groupBy(items, key) {
  const map = new Map();
  for (const item of items) {
    const k = item[key] ?? '其他';
    if (!map.has(k)) map.set(k, []);
    map.get(k).push(item);
  }
  return map;
}

export default function PlaylistPanel({ activeVideoId, onSelect }) {
  const [groups,      setGroups]      = useState(null); // Map<string, item[]>
  const [open,        setOpen]        = useState(true);
  const [activeGroup, setActiveGroup] = useState(null); // selected tab name

  useEffect(() => {
    fetchPlaylist()
      .then(data => {
        const valid = data.filter(d => d.primary);
        const g = groupBy(valid, 'playlist');
        setGroups(g);
        // default tab = group that contains the active video, or first group
        if (activeVideoId) {
          for (const [name, items] of g) {
            if (items.some(i => i.url.includes(activeVideoId))) {
              setActiveGroup(name);
              return;
            }
          }
        }
        setActiveGroup(g.keys().next().value);
      })
      .catch(() => {});
  }, []);

  // When active video changes, switch to its group tab if needed (defer to avoid sync setState in effect)
  useEffect(() => {
    if (!groups || !activeVideoId) return;
    for (const [name, items] of groups) {
      if (items.some(i => i.url.includes(activeVideoId))) {
        queueMicrotask(() => setActiveGroup(name));
        return;
      }
    }
  }, [activeVideoId, groups]);

  if (!groups || groups.size === 0) return null;

  const currentItems = groups.get(activeGroup) ?? [];
  const totalCount   = [...groups.values()].reduce((n, g) => n + g.length, 0);

  return (
    <div className="mb-4 rounded-[10px] border border-[#242424] bg-[#141414] overflow-hidden">

      {/* Panel toggle header */}
      <button
        className="w-full bg-transparent border-0 flex justify-between items-center px-3.5 py-[9px]"
        onClick={() => setOpen(v => !v)}
      >
        <span className="flex items-center gap-[7px] text-[0.75rem] font-semibold tracking-[0.05em] uppercase text-[#555]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#cc0000] inline-block shrink-0" />
          快速載入
          <span className="text-[#3a3a3a] font-normal normal-case tracking-normal text-[0.73rem]">
            {totalCount} 集
          </span>
        </span>
        <span className={`text-[0.8rem] text-[#3a3a3a] inline-block transition-transform duration-200 ${open ? 'rotate-0' : '-rotate-90'}`}>
          ▾
        </span>
      </button>

      {open && (
        <>
          {/* Tabs — only shown when there are multiple playlists */}
          {groups.size > 1 && (
            <div className="flex border-t border-[#1e1e1e] overflow-x-auto hide-scrollbar">
              {[...groups.keys()].map(name => (
                <button
                  key={name}
                  onClick={() => setActiveGroup(name)}
                  className={`bg-transparent border-0 border-b-2 px-3.5 py-[6px] text-[0.72rem] whitespace-nowrap transition-colors shrink-0 ${
                    activeGroup === name
                      ? 'border-[#cc0000] text-[#ccc]'
                      : 'border-transparent text-[#444] hover:text-[#666]'
                  }`}
                >
                  {name}
                  <span className="ml-1.5 text-[0.65rem] text-[#333]">
                    {groups.get(name).length}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Scrollable card row */}
          <div className={`overflow-x-auto hide-scrollbar ${groups.size > 1 ? '' : 'border-t border-[#1e1e1e]'}`}>
            <div className="flex gap-2 px-3.5 py-2.5 w-max">
              {currentItems.map(item => {
                const active = activeVideoId && item.url.includes(activeVideoId);
                return (
                  <button
                    key={item.url}
                    className={`bg-transparent border rounded-lg px-3 py-2 flex items-center gap-[7px] min-w-[120px] max-w-[160px] text-left transition-colors shrink-0 ${
                      active
                        ? 'border-[#cc0000] bg-[rgba(204,0,0,0.06)]'
                        : 'border-[#262626] hover:border-[#333]'
                    }`}
                    onClick={e => {
                      e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                      onSelect(item);
                    }}
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
        </>
      )}
    </div>
  );
}
