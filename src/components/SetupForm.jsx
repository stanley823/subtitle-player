import { useRef } from 'react';

export default function SetupForm({ onLoad }) {
  const urlRef       = useRef(null);
  const primaryRef   = useRef(null);
  const secondaryRef = useRef(null);
  const pNameRef     = useRef(null);
  const sNameRef     = useRef(null);

  function handleFileChange(ref, nameRef) {
    const f = ref.current.files[0];
    nameRef.current.textContent = f ? f.name : '未選擇檔案';
    nameRef.current.style.color = f ? '#4caf82' : '#555';
  }

  function handleSubmit(e) {
    e.preventDefault();
    onLoad({
      url:           urlRef.current.value.trim(),
      primaryFile:   primaryRef.current.files[0]   ?? null,
      secondaryFile: secondaryRef.current.files[0] ?? null,
    });
  }

  return (
    <form onSubmit={handleSubmit}
      className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 mb-4"
    >
      {/* URL row */}
      <div className="flex gap-4 mb-4">
        <div className="flex flex-col flex-1">
          <label className="block text-xs text-[#888] mb-1.5 font-medium">
            YouTube 影片網址
          </label>
          <input
            ref={urlRef}
            type="url"
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full bg-[#242424] border border-[#383838] rounded-[9px] px-3.5 py-2.5 text-[#e0e0e0] text-[0.92rem] outline-none focus:border-[#555] transition-colors"
          />
        </div>
      </div>

      {/* SRT row — stacks on mobile, side-by-side on sm+ */}
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 sm:items-end">

        {/* Primary */}
        <div className="flex flex-col flex-1">
          <label className="block text-xs text-[#888] mb-1.5 font-medium">
            主要字幕 <span className="text-[0.72rem] text-[#555] ml-1">.srt</span>
          </label>
          <label className="flex items-center gap-2 bg-[#242424] border border-dashed border-[#3a3a3a] rounded-[9px] px-3.5 py-2.5 text-[#bbb] text-[0.88rem] cursor-pointer select-none hover:border-[#555] transition-colors">
            <FileIcon />
            選擇 .srt 檔案
            <input
              ref={primaryRef}
              type="file"
              accept=".srt,.txt"
              className="hidden"
              onChange={() => handleFileChange(primaryRef, pNameRef)}
            />
          </label>
          <div ref={pNameRef} className="text-[0.78rem] text-[#555] mt-1.5 overflow-hidden text-ellipsis whitespace-nowrap">
            未選擇檔案
          </div>
        </div>

        {/* Secondary */}
        <div className="flex flex-col flex-1">
          <label className="block text-xs text-[#888] mb-1.5 font-medium">
            第二字幕 <span className="text-[0.72rem] text-[#555] ml-1">選填 — 雙語顯示</span>
          </label>
          <label className="flex items-center gap-2 bg-[#242424] border border-dashed border-[#3a3a3a] rounded-[9px] px-3.5 py-2.5 text-[#bbb] text-[0.88rem] cursor-pointer select-none hover:border-[#555] transition-colors">
            <FileIcon />
            選擇 .srt 檔案（選填）
            <input
              ref={secondaryRef}
              type="file"
              accept=".srt,.txt"
              className="hidden"
              onChange={() => handleFileChange(secondaryRef, sNameRef)}
            />
          </label>
          <div ref={sNameRef} className="text-[0.78rem] text-[#555] mt-1.5 overflow-hidden text-ellipsis whitespace-nowrap">
            未選擇檔案
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-end sm:pb-[22px]">
          <button
            type="submit"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#cc0000] text-white border-0 rounded-[9px] px-6 py-2.5 text-[0.95rem] font-bold whitespace-nowrap"
          >
            ▶ 載入播放
          </button>
        </div>
      </div>
    </form>
  );
}

function FileIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" className="shrink-0">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14,2 14,8 20,8"/>
    </svg>
  );
}
