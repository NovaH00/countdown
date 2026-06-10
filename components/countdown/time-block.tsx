interface TimeBlockProps {
  value: number
  label: string
}

export function TimeBlock({ value, label }: TimeBlockProps) {
  const display = String(value).padStart(2, "0")

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center justify-center w-32 h-32 sm:w-44 sm:h-44 rounded-2xl bg-blue-100 border border-blue-200">
        <span className="font-mono text-5xl sm:text-7xl font-bold text-yellow-500 tabular-nums leading-none">
          {display}
        </span>
      </div>
      <span className="text-sm sm:text-lg font-medium text-black uppercase tracking-wider">
        {label}
      </span>
    </div>
  )
}
