export default function SubtitleOverlay({
  primary,
  secondary,
  subtitleStyles
}) {
  if (!primary && !secondary) return null

  const ps = subtitleStyles?.primary
  const ss = subtitleStyles?.secondary

  const blockBase = {
    width: '100%',
    padding: '4px 12px',
    borderRadius: 4,
    wordWrap: 'break-word',
    lineHeight: 1.55,
    textAlign: 'center'
  }

  const primaryBlock = {
    ...blockBase,
    backgroundColor: ps?.backgroundColor ?? 'rgba(0,0,0,0.78)',
    color: ps?.color ?? '#ffffff',
    fontSize: ps?.fontSize ?? 22
  }

  const secondaryBlock = {
    ...blockBase,
    backgroundColor: ss?.backgroundColor ?? 'rgba(0,0,0,0.65)',
    color: ss?.color ?? '#fde08d',
    fontSize: ss?.fontSize ?? 20
  }

  return (
    <div className="absolute bottom-[7%] left-1/2 -translate-x-1/2 w-[92%] text-center pointer-events-none z-10 flex flex-col items-center gap-[5px]">
      {secondary && (
        <div style={secondaryBlock}>{secondary.text}</div>
      )}
      {primary && (
        <div style={primaryBlock}>{primary.text}</div>
      )}
    </div>
  )
}
