interface TimeBlockProps {
  value: number
  label: string
}

export function TimeBlock({ value, label }: TimeBlockProps) {
  const display = String(value).padStart(2, "0")

  return (
    <div className="flex flex-col items-center gap-1 sm:gap-2 md:gap-3">
      <div className="flex items-center justify-center w-16 h-16 min-[400px]:w-20 min-[400px]:h-20 min-[500px]:w-32 sm:w-44 h-16 min-[400px]:h-20 min-[500px]:h-32 sm:h-44 rounded-xl min-[400px]:rounded-2xl sm:rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg shadow-black/10">
        <span className="font-mono text-2xl min-[400px]:text-3xl min-[500px]:text-5xl sm:text-7xl font-bold text-[#ECC253] tabular-nums leading-none drop-shadow-md">
          {display}
        </span>
      </div>
      <span className="text-[9px] min-[400px]:text-[11px] min-[500px]:text-sm sm:text-lg font-bold text-white uppercase tracking-[0.05em] min-[400px]:tracking-[0.1em] sm:tracking-[0.2em]">
        {label}
      </span>
    </div>
  )
}
