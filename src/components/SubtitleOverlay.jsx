export default function SubtitleOverlay({
  primary,
  secondary,
  subtitleStyles
}) {
  if (!primary && !secondary) return null

  const ps = subtitleStyles?.primary
  const ss = subtitleStyles?.secondary

  const pillBase = {
    display: 'inline',
    lineHeight: 1.55,
    padding: '3px 10px',
    borderRadius: 3,
    boxDecorationBreak: 'clone',
    WebkitBoxDecorationBreak: 'clone',
    wordWrap: 'break-word'
  }

  const primaryPill = {
    ...pillBase,
    backgroundColor: ps?.backgroundColor ?? 'rgba(0,0,0,0.78)',
    color: ps?.color ?? '#ffffff',
    fontSize: ps?.fontSize ?? 22
  }

  const secondaryPill = {
    ...pillBase,
    backgroundColor: ss?.backgroundColor ?? 'rgba(0,0,0,0.65)',
    color: ss?.color ?? '#fde08d',
    fontSize: ss?.fontSize ?? 20
  }

  return (
    <div className="absolute bottom-[7%] left-1/2 -translate-x-1/2 w-[92%] text-center pointer-events-none z-10 flex flex-col items-center gap-[5px]">
      {secondary && (
        <div className="block w-full text-center">
          <span style={secondaryPill}>{secondary.text}</span>
        </div>
      )}
      {primary && (
        <div className="block w-full text-center">
          <span style={primaryPill}>{primary.text}</span>
        </div>
      )}
    </div>
  )
}
