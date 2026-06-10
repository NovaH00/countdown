interface GlowOrbsProps {
  accentColor: string
}

export function GlowOrbs({ accentColor }: GlowOrbsProps) {
  return (
    <>
      <div
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20 blur-[120px] pointer-events-none"
        style={{ backgroundColor: accentColor }}
      />
      <div
        className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full opacity-15 blur-[100px] pointer-events-none"
        style={{ backgroundColor: accentColor }}
      />
    </>
  )
}
