interface GlowOrbsProps {
  accentColor: string
}

export function GlowOrbs({ accentColor }: GlowOrbsProps) {
  return (
    <>
      <div
        className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-30 blur-[120px] pointer-events-none"
        style={{ backgroundColor: accentColor }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10 blur-[150px] pointer-events-none"
        style={{ backgroundColor: "#8D1D41" }}
      />
      <div
        className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full opacity-25 blur-[100px] pointer-events-none"
        style={{ backgroundColor: accentColor }}
      />
    </>
  )
}
