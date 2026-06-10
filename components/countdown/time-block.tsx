interface TimeBlockProps {
  value: number
  label: string
}

export function TimeBlock({ value, label }: TimeBlockProps) {
  const display = String(value).padStart(2, "0")

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center justify-center w-32 h-32 sm:w-44 sm:h-44 rounded-2xl bg-blue-950/60 border border-blue-800/30 backdrop-blur-sm">
        <span className="font-mono text-5xl sm:text-7xl font-bold text-amber-400 tabular-nums leading-none">
          {display}
        </span>
      </div>
      <span className="text-sm sm:text-lg font-medium text-blue-200/80 uppercase tracking-wider">
        {label}
      </span>
    </div>
  )
}
